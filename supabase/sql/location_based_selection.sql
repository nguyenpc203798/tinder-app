-- Function tính khoảng cách giữa hai điểm dựa trên Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 FLOAT,
  lon1 FLOAT,
  lat2 FLOAT,
  lon2 FLOAT
) RETURNS FLOAT AS $$
DECLARE
  R FLOAT := 6371; -- Bán kính Trái Đất (km)
  dLat FLOAT;
  dLon FLOAT;
  a FLOAT;
  c FLOAT;
BEGIN
  -- Chuyển đổi độ sang radian
  dLat := RADIANS(lat2 - lat1);
  dLon := RADIANS(lon2 - lon1);
  
  -- Công thức Haversine
  a := SIN(dLat/2) * SIN(dLat/2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dLon/2) * SIN(dLon/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Function lấy ra 50 user phù hợp nhất dựa trên vị trí
CREATE OR REPLACE FUNCTION get_location_based_candidates(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
  id UUID,
  distance_km FLOAT,
  is_same_location BOOLEAN
) AS $$
DECLARE
  user_latitude FLOAT;
  user_longitude FLOAT;
  user_location TEXT;
  user_age_min INTEGER;
  user_age_max INTEGER;
  user_max_distance_km INTEGER;
  user_preferred_gender TEXT[];
BEGIN
  -- Lấy thông tin người dùng hiện tại
  SELECT 
    up.latitude, up.longitude, up.location,
    COALESCE(upref.age_min, 18) as age_min,
    COALESCE(upref.age_max, 65) as age_max,
    COALESCE(upref.max_distance_km, 50) as max_distance_km,
    COALESCE(upref.preferred_gender, ARRAY['male', 'female', 'other']) as preferred_gender
  INTO
    user_latitude, user_longitude, user_location,
    user_age_min, user_age_max, user_max_distance_km,
    user_preferred_gender
  FROM
    user_profile up
  LEFT JOIN
    user_preferences upref ON up.id = upref.user_id
  WHERE
    up.id = p_user_id;
  
  -- Kiểm tra xem người dùng có tọa độ hay không
  IF user_latitude IS NULL OR user_longitude IS NULL THEN
    RETURN QUERY
    SELECT
      up.id,
      0::FLOAT as distance_km,
      FALSE as is_same_location
    FROM
      user_profile up
    WHERE
      up.id <> p_user_id
      AND up.role = 'customer'
      AND up.age >= user_age_min
      AND up.age <= user_age_max
      AND (up.gender = ANY(user_preferred_gender))
      AND up.id NOT IN (
        SELECT rejected_user_id FROM rejected_users WHERE user_id = p_user_id
      )
    ORDER BY
      up.last_active DESC
    LIMIT p_limit;
    
    RETURN;
  END IF;
  
  -- Lấy danh sách users cùng khu vực (ưu tiên cao nhất)
  RETURN QUERY
  WITH same_location_users AS (
    SELECT
      up.id,
      calculate_distance(user_latitude, user_longitude, up.latitude, up.longitude) as distance_km,
      TRUE as is_same_location
    FROM
      user_profile up
    WHERE
      up.id <> p_user_id
      AND up.role = 'customer'
      AND up.age >= user_age_min
      AND up.age <= user_age_max
      AND (up.gender = ANY(user_preferred_gender))
      AND up.location = user_location
      AND up.id NOT IN (
        SELECT rejected_user_id FROM rejected_users WHERE user_id = p_user_id
      )
  ),
  different_location_users AS (
    SELECT
      up.id,
      calculate_distance(user_latitude, user_longitude, up.latitude, up.longitude) as distance_km,
      FALSE as is_same_location
    FROM
      user_profile up
    WHERE
      up.id <> p_user_id
      AND up.role = 'customer'
      AND up.age >= user_age_min
      AND up.age <= user_age_max
      AND (up.gender = ANY(user_preferred_gender))
      AND up.location <> user_location
      AND up.id NOT IN (
        SELECT rejected_user_id FROM rejected_users WHERE user_id = p_user_id
      )
      AND calculate_distance(user_latitude, user_longitude, up.latitude, up.longitude) <= user_max_distance_km
  ),
  all_users AS (
    SELECT id, distance_km, is_same_location FROM same_location_users
    UNION ALL
    SELECT id, distance_km, is_same_location FROM different_location_users
  ),
  ranked_users AS (
    SELECT
      id,
      distance_km,
      is_same_location,
      ROW_NUMBER() OVER (
        ORDER BY
          is_same_location DESC, -- Ưu tiên cùng location
          distance_km ASC        -- Sau đó ưu tiên khoảng cách gần
      ) as rank
    FROM
      all_users
  ),
  random_users AS (
    SELECT
      up.id,
      99999 as distance_km,
      FALSE as is_same_location
    FROM
      user_profile up
    WHERE
      up.id <> p_user_id
      AND up.role = 'customer'
      AND up.id NOT IN (
        SELECT id FROM all_users
      )
      AND up.id NOT IN (
        SELECT rejected_user_id FROM rejected_users WHERE user_id = p_user_id
      )
    ORDER BY
      RANDOM()
    LIMIT p_limit
  ),
  combined_users AS (
    SELECT * FROM ranked_users
    UNION ALL
    SELECT id, distance_km, is_same_location, p_limit + ROW_NUMBER() OVER () as rank 
    FROM random_users
  )
  SELECT
    id,
    distance_km,
    is_same_location
  FROM
    combined_users
  ORDER BY
    rank
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql; 