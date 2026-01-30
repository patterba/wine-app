-- AutographHero Team Seed Data
-- All NFL (32), MLB (30), NBA (30), NHL (32) teams
-- Run this AFTER 001_initial_schema.sql

-----------------------------------------------------------
-- NFL TEAMS (32)
-----------------------------------------------------------

INSERT INTO teams (name, sport, city) VALUES
-- AFC East
('Buffalo Bills', 'NFL', 'Buffalo'),
('Miami Dolphins', 'NFL', 'Miami'),
('New England Patriots', 'NFL', 'Foxborough'),
('New York Jets', 'NFL', 'East Rutherford'),
-- AFC North
('Baltimore Ravens', 'NFL', 'Baltimore'),
('Cincinnati Bengals', 'NFL', 'Cincinnati'),
('Cleveland Browns', 'NFL', 'Cleveland'),
('Pittsburgh Steelers', 'NFL', 'Pittsburgh'),
-- AFC South
('Houston Texans', 'NFL', 'Houston'),
('Indianapolis Colts', 'NFL', 'Indianapolis'),
('Jacksonville Jaguars', 'NFL', 'Jacksonville'),
('Tennessee Titans', 'NFL', 'Nashville'),
-- AFC West
('Denver Broncos', 'NFL', 'Denver'),
('Kansas City Chiefs', 'NFL', 'Kansas City'),
('Las Vegas Raiders', 'NFL', 'Las Vegas'),
('Los Angeles Chargers', 'NFL', 'Inglewood'),
-- NFC East
('Dallas Cowboys', 'NFL', 'Arlington'),
('New York Giants', 'NFL', 'East Rutherford'),
('Philadelphia Eagles', 'NFL', 'Philadelphia'),
('Washington Commanders', 'NFL', 'Landover'),
-- NFC North
('Chicago Bears', 'NFL', 'Chicago'),
('Detroit Lions', 'NFL', 'Detroit'),
('Green Bay Packers', 'NFL', 'Green Bay'),
('Minnesota Vikings', 'NFL', 'Minneapolis'),
-- NFC South
('Atlanta Falcons', 'NFL', 'Atlanta'),
('Carolina Panthers', 'NFL', 'Charlotte'),
('New Orleans Saints', 'NFL', 'New Orleans'),
('Tampa Bay Buccaneers', 'NFL', 'Tampa'),
-- NFC West
('Arizona Cardinals', 'NFL', 'Glendale'),
('Los Angeles Rams', 'NFL', 'Inglewood'),
('San Francisco 49ers', 'NFL', 'Santa Clara'),
('Seattle Seahawks', 'NFL', 'Seattle');

-----------------------------------------------------------
-- MLB TEAMS (30)
-----------------------------------------------------------

INSERT INTO teams (name, sport, city) VALUES
-- AL East
('Baltimore Orioles', 'MLB', 'Baltimore'),
('Boston Red Sox', 'MLB', 'Boston'),
('New York Yankees', 'MLB', 'Bronx'),
('Tampa Bay Rays', 'MLB', 'St. Petersburg'),
('Toronto Blue Jays', 'MLB', 'Toronto'),
-- AL Central
('Chicago White Sox', 'MLB', 'Chicago'),
('Cleveland Guardians', 'MLB', 'Cleveland'),
('Detroit Tigers', 'MLB', 'Detroit'),
('Kansas City Royals', 'MLB', 'Kansas City'),
('Minnesota Twins', 'MLB', 'Minneapolis'),
-- AL West
('Houston Astros', 'MLB', 'Houston'),
('Los Angeles Angels', 'MLB', 'Anaheim'),
('Oakland Athletics', 'MLB', 'Oakland'),
('Seattle Mariners', 'MLB', 'Seattle'),
('Texas Rangers', 'MLB', 'Arlington'),
-- NL East
('Atlanta Braves', 'MLB', 'Atlanta'),
('Miami Marlins', 'MLB', 'Miami'),
('New York Mets', 'MLB', 'Queens'),
('Philadelphia Phillies', 'MLB', 'Philadelphia'),
('Washington Nationals', 'MLB', 'Washington'),
-- NL Central
('Chicago Cubs', 'MLB', 'Chicago'),
('Cincinnati Reds', 'MLB', 'Cincinnati'),
('Milwaukee Brewers', 'MLB', 'Milwaukee'),
('Pittsburgh Pirates', 'MLB', 'Pittsburgh'),
('St. Louis Cardinals', 'MLB', 'St. Louis'),
-- NL West
('Arizona Diamondbacks', 'MLB', 'Phoenix'),
('Colorado Rockies', 'MLB', 'Denver'),
('Los Angeles Dodgers', 'MLB', 'Los Angeles'),
('San Diego Padres', 'MLB', 'San Diego'),
('San Francisco Giants', 'MLB', 'San Francisco');

-----------------------------------------------------------
-- NBA TEAMS (30)
-----------------------------------------------------------

INSERT INTO teams (name, sport, city) VALUES
-- Atlantic
('Boston Celtics', 'NBA', 'Boston'),
('Brooklyn Nets', 'NBA', 'Brooklyn'),
('New York Knicks', 'NBA', 'New York'),
('Philadelphia 76ers', 'NBA', 'Philadelphia'),
('Toronto Raptors', 'NBA', 'Toronto'),
-- Central
('Chicago Bulls', 'NBA', 'Chicago'),
('Cleveland Cavaliers', 'NBA', 'Cleveland'),
('Detroit Pistons', 'NBA', 'Detroit'),
('Indiana Pacers', 'NBA', 'Indianapolis'),
('Milwaukee Bucks', 'NBA', 'Milwaukee'),
-- Southeast
('Atlanta Hawks', 'NBA', 'Atlanta'),
('Charlotte Hornets', 'NBA', 'Charlotte'),
('Miami Heat', 'NBA', 'Miami'),
('Orlando Magic', 'NBA', 'Orlando'),
('Washington Wizards', 'NBA', 'Washington'),
-- Northwest
('Denver Nuggets', 'NBA', 'Denver'),
('Minnesota Timberwolves', 'NBA', 'Minneapolis'),
('Oklahoma City Thunder', 'NBA', 'Oklahoma City'),
('Portland Trail Blazers', 'NBA', 'Portland'),
('Utah Jazz', 'NBA', 'Salt Lake City'),
-- Pacific
('Golden State Warriors', 'NBA', 'San Francisco'),
('Los Angeles Clippers', 'NBA', 'Los Angeles'),
('Los Angeles Lakers', 'NBA', 'Los Angeles'),
('Phoenix Suns', 'NBA', 'Phoenix'),
('Sacramento Kings', 'NBA', 'Sacramento'),
-- Southwest
('Dallas Mavericks', 'NBA', 'Dallas'),
('Houston Rockets', 'NBA', 'Houston'),
('Memphis Grizzlies', 'NBA', 'Memphis'),
('New Orleans Pelicans', 'NBA', 'New Orleans'),
('San Antonio Spurs', 'NBA', 'San Antonio');

-----------------------------------------------------------
-- NHL TEAMS (32)
-----------------------------------------------------------

INSERT INTO teams (name, sport, city) VALUES
-- Atlantic
('Boston Bruins', 'NHL', 'Boston'),
('Buffalo Sabres', 'NHL', 'Buffalo'),
('Detroit Red Wings', 'NHL', 'Detroit'),
('Florida Panthers', 'NHL', 'Sunrise'),
('Montreal Canadiens', 'NHL', 'Montreal'),
('Ottawa Senators', 'NHL', 'Ottawa'),
('Tampa Bay Lightning', 'NHL', 'Tampa'),
('Toronto Maple Leafs', 'NHL', 'Toronto'),
-- Metropolitan
('Carolina Hurricanes', 'NHL', 'Raleigh'),
('Columbus Blue Jackets', 'NHL', 'Columbus'),
('New Jersey Devils', 'NHL', 'Newark'),
('New York Islanders', 'NHL', 'Elmont'),
('New York Rangers', 'NHL', 'New York'),
('Philadelphia Flyers', 'NHL', 'Philadelphia'),
('Pittsburgh Penguins', 'NHL', 'Pittsburgh'),
('Washington Capitals', 'NHL', 'Washington'),
-- Central
('Arizona Coyotes', 'NHL', 'Tempe'),
('Chicago Blackhawks', 'NHL', 'Chicago'),
('Colorado Avalanche', 'NHL', 'Denver'),
('Dallas Stars', 'NHL', 'Dallas'),
('Minnesota Wild', 'NHL', 'Saint Paul'),
('Nashville Predators', 'NHL', 'Nashville'),
('St. Louis Blues', 'NHL', 'St. Louis'),
('Winnipeg Jets', 'NHL', 'Winnipeg'),
-- Pacific
('Anaheim Ducks', 'NHL', 'Anaheim'),
('Calgary Flames', 'NHL', 'Calgary'),
('Edmonton Oilers', 'NHL', 'Edmonton'),
('Los Angeles Kings', 'NHL', 'Los Angeles'),
('San Jose Sharks', 'NHL', 'San Jose'),
('Seattle Kraken', 'NHL', 'Seattle'),
('Vancouver Canucks', 'NHL', 'Vancouver'),
('Vegas Golden Knights', 'NHL', 'Las Vegas');
