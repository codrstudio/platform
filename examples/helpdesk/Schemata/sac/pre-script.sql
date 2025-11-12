-- Cria schema API se não existir
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'api') EXEC('CREATE SCHEMA api') ;
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'jsql') EXEC('CREATE SCHEMA jsql') ;
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'sac') EXEC('CREATE SCHEMA sac') ;
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'tom') EXEC('CREATE SCHEMA tom') ;
