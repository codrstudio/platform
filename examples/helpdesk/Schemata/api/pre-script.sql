-- Cria schema API se não existir
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'api') EXEC('CREATE SCHEMA api') ;
