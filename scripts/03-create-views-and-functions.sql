-- Useful views and functions for the Ijtema Management System

-- View for participant summary with region and majlis info
CREATE OR REPLACE VIEW participant_summary AS
SELECT 
    p.id,
    p.registration_number,
    p.name,
    p.islamic_name,
    p.age,
    p.category,
    p.mobile_number,
    r.name as region_name,
    r.code as region_code,
    m.name as majlis_name,
    m.code as majlis_code,
    p.created_at
FROM participants p
LEFT JOIN regions r ON p.region_id = r.id
LEFT JOIN majlis m ON p.majlis_id = m.id;

-- View for academic statistics
CREATE OR REPLACE VIEW academic_statistics AS
SELECT 
    COUNT(*) as total_participants,
    COUNT(CASE WHEN knows_prayer_full = true THEN 1 END) as knows_prayer_full_count,
    COUNT(CASE WHEN knows_prayer_meaning = true THEN 1 END) as knows_prayer_meaning_count,
    COUNT(CASE WHEN can_read_quran = true THEN 1 END) as can_read_quran_count,
    COUNT(CASE WHEN owns_bicycle = true THEN 1 END) as owns_bicycle_count,
    ROUND(COUNT(CASE WHEN knows_prayer_full = true THEN 1 END) * 100.0 / COUNT(*), 1) as knows_prayer_full_percentage,
    ROUND(COUNT(CASE WHEN knows_prayer_meaning = true THEN 1 END) * 100.0 / COUNT(*), 1) as knows_prayer_meaning_percentage,
    ROUND(COUNT(CASE WHEN can_read_quran = true THEN 1 END) * 100.0 / COUNT(*), 1) as can_read_quran_percentage,
    ROUND(COUNT(CASE WHEN owns_bicycle = true THEN 1 END) * 100.0 / COUNT(*), 1) as owns_bicycle_percentage
FROM academic_data;

-- View for contribution summary
CREATE OR REPLACE VIEW contribution_summary AS
SELECT 
    contribution_type,
    COUNT(*) as total_contributions,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount,
    month,
    year
FROM contributions
GROUP BY contribution_type, month, year
ORDER BY year DESC, month, contribution_type;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_participants', (SELECT COUNT(*) FROM participants),
        'saf_awwal_count', (SELECT COUNT(*) FROM participants WHERE category = 'Saf Awwal'),
        'saf_dom_count', (SELECT COUNT(*) FROM participants WHERE category = 'Saf Dom'),
        'total_regions', (SELECT COUNT(*) FROM regions),
        'total_majlis', (SELECT COUNT(*) FROM majlis),
        'total_contributions', (SELECT COALESCE(SUM(amount), 0) FROM contributions),
        'academic_responses', (SELECT COUNT(*) FROM academic_data)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get participant details with all related data
CREATE OR REPLACE FUNCTION get_participant_details(participant_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'participant', row_to_json(ps),
        'academic_data', (
            SELECT json_agg(row_to_json(ad))
            FROM academic_data ad
            WHERE ad.participant_id = participant_uuid
        ),
        'contributions', (
            SELECT json_agg(row_to_json(c))
            FROM contributions c
            WHERE c.participant_id = participant_uuid
        )
    ) INTO result
    FROM participant_summary ps
    WHERE ps.id = participant_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
