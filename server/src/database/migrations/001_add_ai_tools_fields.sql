-- 数据库迁移脚本：为ai_tools表添加新字段
-- 执行时间：2024年

-- 添加新字段到ai_tools表（SQLite每次只能添加一个字段）
ALTER TABLE ai_tools ADD COLUMN short_description TEXT;
ALTER TABLE ai_tools ADD COLUMN subcategory VARCHAR(100);
ALTER TABLE ai_tools ADD COLUMN screenshot_url VARCHAR(500);
ALTER TABLE ai_tools ADD COLUMN rating_count INT DEFAULT 0;
ALTER TABLE ai_tools ADD COLUMN pricing_details TEXT;
ALTER TABLE ai_tools ADD COLUMN is_trending BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_tools ADD COLUMN is_new BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_tools ADD COLUMN like_count INT DEFAULT 0;
ALTER TABLE ai_tools ADD COLUMN bookmark_count INT DEFAULT 0;
ALTER TABLE ai_tools ADD COLUMN monthly_visits INT DEFAULT 0;
ALTER TABLE ai_tools ADD COLUMN launch_date DATE;
ALTER TABLE ai_tools ADD COLUMN company VARCHAR(255);
ALTER TABLE ai_tools ADD COLUMN country VARCHAR(100);
ALTER TABLE ai_tools ADD COLUMN languages TEXT;
ALTER TABLE ai_tools ADD COLUMN platforms TEXT;
ALTER TABLE ai_tools ADD COLUMN api_available BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_tools ADD COLUMN open_source BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_tools ADD COLUMN free_tier BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_tools ADD COLUMN trial_available BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_tools ADD COLUMN mobile_app BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_tools ADD COLUMN chrome_extension BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_tools ADD COLUMN integrations TEXT;
ALTER TABLE ai_tools ADD COLUMN use_cases TEXT;
ALTER TABLE ai_tools ADD COLUMN target_audience TEXT;
ALTER TABLE ai_tools ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'beginner';

-- 添加新的索引
CREATE INDEX idx_subcategory ON ai_tools(subcategory);
CREATE INDEX idx_is_trending ON ai_tools(is_trending);
CREATE INDEX idx_is_new ON ai_tools(is_new);
CREATE INDEX idx_pricing ON ai_tools(pricing);
CREATE INDEX idx_api_available ON ai_tools(api_available);
CREATE INDEX idx_open_source ON ai_tools(open_source);
CREATE INDEX idx_free_tier ON ai_tools(free_tier);
CREATE INDEX idx_trial_available ON ai_tools(trial_available);
CREATE INDEX idx_mobile_app ON ai_tools(mobile_app);
CREATE INDEX idx_chrome_extension ON ai_tools(chrome_extension);
CREATE INDEX idx_difficulty_level ON ai_tools(difficulty_level);
CREATE INDEX idx_like_count ON ai_tools(like_count);
CREATE INDEX idx_bookmark_count ON ai_tools(bookmark_count);
CREATE INDEX idx_monthly_visits ON ai_tools(monthly_visits);
CREATE INDEX idx_launch_date ON ai_tools(launch_date);

-- 更新现有数据的默认值（可选）
UPDATE ai_tools SET 
    short_description = SUBSTRING(description, 1, 200),
    subcategory = '',
    screenshot_url = '',
    rating_count = 0,
    pricing_details = '',
    is_trending = FALSE,
    is_new = FALSE,
    like_count = 0,
    bookmark_count = 0,
    monthly_visits = 0,
    company = '',
    country = '',
    languages = JSON_ARRAY(),
    platforms = JSON_ARRAY(),
    api_available = FALSE,
    open_source = FALSE,
    free_tier = (pricing = 'free'),
    trial_available = FALSE,
    mobile_app = FALSE,
    chrome_extension = FALSE,
    integrations = JSON_ARRAY(),
    use_cases = JSON_ARRAY(),
    target_audience = JSON_ARRAY(),
    difficulty_level = 'beginner'
WHERE 1=1;