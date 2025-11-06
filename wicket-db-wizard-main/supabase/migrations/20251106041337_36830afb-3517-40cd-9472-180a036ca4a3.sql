-- Cricket Statistics Database Schema

-- Teams table
CREATE TABLE teams (
  team_id SERIAL PRIMARY KEY,
  team_name VARCHAR(100) UNIQUE NOT NULL,
  coach VARCHAR(100),
  country VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Players table
CREATE TABLE players (
  player_id SERIAL PRIMARY KEY,
  player_name VARCHAR(100) NOT NULL,
  dob DATE,
  team_id INT REFERENCES teams(team_id),
  role VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Matches table
CREATE TABLE matches (
  match_id SERIAL PRIMARY KEY,
  match_date DATE NOT NULL,
  venue VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Match_Teams junction table (many-to-many)
CREATE TABLE match_teams (
  match_id INT REFERENCES matches(match_id) ON DELETE CASCADE,
  team_id INT REFERENCES teams(team_id),
  PRIMARY KEY (match_id, team_id)
);

-- Match_Scores table
CREATE TABLE match_scores (
  score_id SERIAL PRIMARY KEY,
  match_id INT REFERENCES matches(match_id) ON DELETE CASCADE,
  team_id INT REFERENCES teams(team_id),
  score INT NOT NULL,
  UNIQUE (match_id, team_id)
);

-- Performance table (unique per player+match)
CREATE TABLE performance (
  performance_id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(player_id),
  match_id INT REFERENCES matches(match_id) ON DELETE CASCADE,
  runs INT DEFAULT 0,
  wickets INT DEFAULT 0,
  catches INT DEFAULT 0,
  UNIQUE (player_id, match_id)
);

-- Awards table (4NF: one row per award instance)
CREATE TABLE awards (
  award_id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(player_id),
  match_id INT REFERENCES matches(match_id),
  award_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Match_Result table (one result per match)
CREATE TABLE match_result (
  result_id SERIAL PRIMARY KEY,
  match_id INT UNIQUE REFERENCES matches(match_id) ON DELETE CASCADE,
  winner_team_id INT REFERENCES teams(team_id),
  margin INT
);

-- SQL Execution Logs table
CREATE TABLE sql_logs (
  log_id SERIAL PRIMARY KEY,
  sql_text TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  operation_type VARCHAR(50)
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_result ENABLE ROW LEVEL SECURITY;
ALTER TABLE sql_logs ENABLE ROW LEVEL SECURITY;

-- Public read access policies (since this is a demo/educational app)
CREATE POLICY "Allow public read on teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert on teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on teams" ON teams FOR DELETE USING (true);

CREATE POLICY "Allow public read on players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert on players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on players" ON players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on players" ON players FOR DELETE USING (true);

CREATE POLICY "Allow public read on matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert on matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on matches" ON matches FOR DELETE USING (true);

CREATE POLICY "Allow public read on match_teams" ON match_teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert on match_teams" ON match_teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on match_teams" ON match_teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on match_teams" ON match_teams FOR DELETE USING (true);

CREATE POLICY "Allow public read on match_scores" ON match_scores FOR SELECT USING (true);
CREATE POLICY "Allow public insert on match_scores" ON match_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on match_scores" ON match_scores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on match_scores" ON match_scores FOR DELETE USING (true);

CREATE POLICY "Allow public read on performance" ON performance FOR SELECT USING (true);
CREATE POLICY "Allow public insert on performance" ON performance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on performance" ON performance FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on performance" ON performance FOR DELETE USING (true);

CREATE POLICY "Allow public read on awards" ON awards FOR SELECT USING (true);
CREATE POLICY "Allow public insert on awards" ON awards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on awards" ON awards FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on awards" ON awards FOR DELETE USING (true);

CREATE POLICY "Allow public read on match_result" ON match_result FOR SELECT USING (true);
CREATE POLICY "Allow public insert on match_result" ON match_result FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on match_result" ON match_result FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on match_result" ON match_result FOR DELETE USING (true);

CREATE POLICY "Allow public read on sql_logs" ON sql_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on sql_logs" ON sql_logs FOR INSERT WITH CHECK (true);

-- Stored Procedure: InsertPerformance
CREATE OR REPLACE PROCEDURE insert_performance(
  p_player_id INT, 
  p_match_id INT, 
  p_runs INT, 
  p_wickets INT, 
  p_catches INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO performance(player_id, match_id, runs, wickets, catches)
  VALUES (p_player_id, p_match_id, p_runs, p_wickets, p_catches)
  ON CONFLICT (player_id, match_id) DO UPDATE
    SET runs = EXCLUDED.runs, 
        wickets = EXCLUDED.wickets, 
        catches = EXCLUDED.catches;
END;
$$;

-- Function: GetTotalRuns
CREATE OR REPLACE FUNCTION get_total_runs(p_player_id INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE total INT;
BEGIN
  SELECT COALESCE(SUM(runs), 0) INTO total 
  FROM performance 
  WHERE player_id = p_player_id;
  RETURN total;
END;
$$;

-- View: MatchPerformanceSummary
CREATE OR REPLACE VIEW match_performance_summary AS
SELECT 
  p.player_name, 
  m.match_date, 
  m.venue,
  per.runs, 
  per.wickets, 
  per.catches
FROM performance per
JOIN players p ON per.player_id = p.player_id
JOIN matches m ON per.match_id = m.match_id
ORDER BY m.match_date DESC;

-- Trigger Function: Update Match_Result after scores inserted
CREATE OR REPLACE FUNCTION update_match_result_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  cnt INT;
  t1 RECORD;
  t2 RECORD;
  winner INT;
  margin INT;
BEGIN
  SELECT COUNT(*) INTO cnt FROM match_scores WHERE match_id = NEW.match_id;
  
  IF cnt < 2 THEN
    RETURN NEW;
  END IF;

  SELECT * INTO t1 FROM match_scores WHERE match_id = NEW.match_id ORDER BY score DESC LIMIT 1 OFFSET 0;
  SELECT * INTO t2 FROM match_scores WHERE match_id = NEW.match_id ORDER BY score DESC LIMIT 1 OFFSET 1;

  IF t1.score >= t2.score THEN
    winner := t1.team_id;
    margin := t1.score - t2.score;
  ELSE
    winner := t2.team_id;
    margin := t2.score - t1.score;
  END IF;

  INSERT INTO match_result(match_id, winner_team_id, margin)
  VALUES (NEW.match_id, winner, margin)
  ON CONFLICT (match_id) DO UPDATE
    SET winner_team_id = EXCLUDED.winner_team_id, 
        margin = EXCLUDED.margin;

  RETURN NEW;
END;
$$;

-- Trigger: Update Match_Result
CREATE TRIGGER trg_update_match_result
AFTER INSERT ON match_scores
FOR EACH ROW EXECUTE FUNCTION update_match_result_fn();

-- Enable Realtime for match_result table
ALTER PUBLICATION supabase_realtime ADD TABLE match_result;

-- Sample Data
INSERT INTO teams (team_name, coach, country) VALUES
('Mumbai Indians', 'Mahela Jayawardene', 'India'),
('Chennai Super Kings', 'Stephen Fleming', 'India'),
('Royal Challengers Bangalore', 'Sanjay Bangar', 'India'),
('Kolkata Knight Riders', 'Brendon McCullum', 'India'),
('Delhi Capitals', 'Ricky Ponting', 'India'),
('Punjab Kings', 'Trevor Bayliss', 'India'),
('Rajasthan Royals', 'Kumar Sangakkara', 'India'),
('Sunrisers Hyderabad', 'Brian Lara', 'India');

INSERT INTO players (player_name, dob, team_id, role) VALUES
('Rohit Sharma', '1987-04-30', 1, 'Batsman'),
('Jasprit Bumrah', '1993-12-06', 1, 'Bowler'),
('Suryakumar Yadav', '1990-09-14', 1, 'Batsman'),
('MS Dhoni', '1981-07-07', 2, 'Wicket-keeper'),
('Ravindra Jadeja', '1988-12-06', 2, 'All-rounder'),
('Deepak Chahar', '1992-08-07', 2, 'Bowler'),
('Virat Kohli', '1988-11-05', 3, 'Batsman'),
('Glenn Maxwell', '1988-10-14', 3, 'All-rounder'),
('Mohammed Siraj', '1994-03-13', 3, 'Bowler'),
('Andre Russell', '1988-04-29', 4, 'All-rounder'),
('Sunil Narine', '1988-05-26', 4, 'Bowler'),
('Shreyas Iyer', '1994-12-06', 4, 'Batsman'),
('Rishabh Pant', '1997-10-04', 5, 'Wicket-keeper'),
('David Warner', '1986-10-27', 5, 'Batsman'),
('Axar Patel', '1994-01-20', 5, 'All-rounder');

INSERT INTO matches (match_date, venue) VALUES
('2024-03-22', 'Wankhede Stadium, Mumbai'),
('2024-03-23', 'MA Chidambaram Stadium, Chennai'),
('2024-03-24', 'M Chinnaswamy Stadium, Bangalore'),
('2024-03-25', 'Eden Gardens, Kolkata'),
('2024-03-26', 'Arun Jaitley Stadium, Delhi'),
('2024-03-27', 'PCA Stadium, Mohali'),
('2024-03-28', 'Sawai Mansingh Stadium, Jaipur'),
('2024-03-29', 'Rajiv Gandhi International Stadium, Hyderabad');

INSERT INTO match_teams (match_id, team_id) VALUES
(1, 1), (1, 2),
(2, 3), (2, 4),
(3, 5), (3, 6),
(4, 7), (4, 8),
(5, 1), (5, 3),
(6, 2), (6, 4),
(7, 5), (7, 7),
(8, 6), (8, 8);

INSERT INTO match_scores (match_id, team_id, score) VALUES
(1, 1, 185), (1, 2, 178),
(2, 3, 195), (2, 4, 192),
(3, 5, 175), (3, 6, 168),
(4, 7, 201), (4, 8, 198),
(5, 1, 167), (5, 3, 172),
(6, 2, 188), (6, 4, 185),
(7, 5, 190), (7, 7, 186),
(8, 6, 155), (8, 8, 160);

INSERT INTO performance (player_id, match_id, runs, wickets, catches) VALUES
(1, 1, 65, 0, 1), (2, 1, 0, 3, 0), (3, 1, 42, 0, 2),
(4, 1, 58, 0, 2), (5, 1, 28, 2, 1), (6, 1, 0, 2, 0),
(7, 2, 82, 0, 0), (8, 2, 45, 1, 1), (9, 2, 0, 4, 0),
(10, 2, 52, 2, 1), (11, 2, 0, 3, 0), (12, 2, 38, 0, 2),
(13, 3, 71, 0, 3), (14, 3, 55, 0, 1), (15, 3, 12, 2, 0),
(1, 5, 48, 0, 0), (2, 5, 0, 2, 0), (3, 5, 35, 0, 1),
(7, 5, 89, 0, 1), (8, 5, 31, 1, 0), (9, 5, 0, 3, 0);

INSERT INTO awards (player_id, match_id, award_name) VALUES
(1, 1, 'Player of the Match'),
(7, 2, 'Player of the Match'),
(13, 3, 'Player of the Match'),
(2, 1, 'Best Bowler'),
(9, 2, 'Best Bowler'),
(7, 5, 'Player of the Match');