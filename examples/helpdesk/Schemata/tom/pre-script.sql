-- Cria schema API se não existir
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'tom') EXEC('CREATE SCHEMA tom') ;
