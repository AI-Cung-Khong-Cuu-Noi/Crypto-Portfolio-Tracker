-- =============================================
-- SQL SCHEMA + SEED DATA
-- Crypto Portfolio Tracker
-- PostgreSQL 15+
-- =============================================

-- Bật extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS
-- =============================================
CREATE TABLE users (
    user_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100),
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. PORTFOLIOS
-- =============================================
CREATE TABLE portfolios (
    portfolio_id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE,           -- 1 User : 1 Main Portfolio
    name            VARCHAR(50) DEFAULT 'Main Portfolio',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_portfolios_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- 3. ASSET HOLDINGS
-- =============================================
CREATE TABLE asset_holdings (
    holding_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id    UUID NOT NULL,
    coin_symbol     VARCHAR(20) NOT NULL,           -- BTC, ETH...
    quantity        DECIMAL(18,8) NOT NULL DEFAULT 0,
    average_cost    DECIMAL(18,8),
    last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (portfolio_id, coin_symbol),             -- 1 portfolio chỉ có 1 dòng cho mỗi coin
    CONSTRAINT fk_holdings_portfolio 
        FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id) ON DELETE CASCADE
);

-- =============================================
-- 4. TRANSACTIONS
-- =============================================
CREATE TABLE transactions (
    tx_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id    UUID NOT NULL,
    coin_symbol     VARCHAR(20) NOT NULL,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('buy', 'sell', 'transfer')),
    quantity        DECIMAL(18,8) NOT NULL,
    price           DECIMAL(18,8) NOT NULL,
    total_usd       DECIMAL(18,2),
    timestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exchange_name   VARCHAR(50),
    notes           TEXT,
    CONSTRAINT fk_transactions_portfolio 
        FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id) ON DELETE CASCADE
);

-- =============================================
-- 5. EXCHANGE CONNECTIONS
-- =============================================
CREATE TABLE exchange_connections (
    connection_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL,
    exchange_name   VARCHAR(50) NOT NULL,           -- Binance, Coinbase...
    encrypted_api_key TEXT NOT NULL,
    encrypted_secret TEXT,
    is_active       BOOLEAN DEFAULT true,
    last_synced_at  TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_connections_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- 6. ALERTS
-- =============================================
CREATE TABLE alerts (
    alert_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL,
    coin_symbol     VARCHAR(20) NOT NULL,
    condition_type  VARCHAR(30) NOT NULL,           -- price_above, percent_change...
    target_value    DECIMAL(18,8) NOT NULL,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_notified   TIMESTAMP,
    CONSTRAINT fk_alerts_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- INDEXES (tăng tốc query)
-- =============================================
CREATE INDEX idx_asset_holdings_portfolio ON asset_holdings(portfolio_id);
CREATE INDEX idx_transactions_portfolio ON transactions(portfolio_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_exchange_connections_user ON exchange_connections(user_id);

-- =============================================
-- SEED DATA (Dữ liệu mẫu để test)
-- =============================================

-- 1. Users
INSERT INTO users (email, password_hash, full_name, preferred_currency) VALUES
('hieu@example.com', '$2b$12$examplehash1234567890', 'Nguyễn Hiếu', 'VND'),
('lan@example.com',  '$2b$12$examplehash1234567890', 'Trần Lan', 'USD');

-- 2. Portfolios
INSERT INTO portfolios (user_id, name) VALUES
((SELECT user_id FROM users WHERE email = 'hieu@example.com'), 'Main Portfolio'),
((SELECT user_id FROM users WHERE email = 'lan@example.com'),  'Main Portfolio');

-- 3. Asset Holdings
INSERT INTO asset_holdings (portfolio_id, coin_symbol, quantity, average_cost) VALUES
((SELECT portfolio_id FROM portfolios WHERE user_id = (SELECT user_id FROM users WHERE email = 'hieu@example.com')), 'BTC', 0.45, 62000.00),
((SELECT portfolio_id FROM portfolios WHERE user_id = (SELECT user_id FROM users WHERE email = 'hieu@example.com')), 'ETH', 8.2,  2800.00),
((SELECT portfolio_id FROM portfolios WHERE user_id = (SELECT user_id FROM users WHERE email = 'hieu@example.com')), 'SOL', 120.5, 140.00),
((SELECT portfolio_id FROM portfolios WHERE user_id = (SELECT user_id FROM users WHERE email = 'lan@example.com')),  'BTC', 0.12, 65000.00);

-- 4. Transactions
INSERT INTO transactions (portfolio_id, coin_symbol, type, quantity, price, total_usd, exchange_name, notes) VALUES
((SELECT portfolio_id FROM portfolios WHERE user_id = (SELECT user_id FROM users WHERE email = 'hieu@example.com')), 'BTC', 'buy', 0.3,  61000, 18300, 'Binance', 'Mua dip tháng 3'),
((SELECT portfolio_id FROM portfolios WHERE user_id = (SELECT user_id FROM users WHERE email = 'hieu@example.com')), 'ETH', 'buy', 5.0,   2700,  13500, 'Coinbase', NULL),
((SELECT portfolio_id FROM portfolios WHERE user_id = (SELECT user_id FROM users WHERE email = 'hieu@example.com')), 'BTC', 'sell', 0.05, 68000, 3400,  'Binance', 'Chốt lời nhỏ');

-- 5. Exchange Connections
INSERT INTO exchange_connections (user_id, exchange_name, encrypted_api_key, encrypted_secret) VALUES
((SELECT user_id FROM users WHERE email = 'hieu@example.com'), 'Binance', 'aes256:encrypted_key_123', 'aes256:encrypted_secret_456'),
((SELECT user_id FROM users WHERE email = 'hieu@example.com'), 'Coinbase', 'aes256:encrypted_key_789', 'aes256:encrypted_secret_012');

-- 6. Alerts
INSERT INTO alerts (user_id, coin_symbol, condition_type, target_value) VALUES
((SELECT user_id FROM users WHERE email = 'hieu@example.com'), 'BTC', 'price_above', 70000),
((SELECT user_id FROM users WHERE email = 'hieu@example.com'), 'ETH', 'percent_change', 10);

-- =============================================
-- Kết thúc file
-- =============================================