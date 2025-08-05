-- Script para crear la tabla de egresos
-- Ejecutar: mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < create-expenses-table.sql

-- Crear tabla de egresos
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  type ENUM('WORKSHOP', 'PARTS', 'COMMISSION') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  workshopId VARCHAR(191) NULL,
  sellerId VARCHAR(191) NULL,
  receiptPath VARCHAR(500) NULL,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  
  -- Foreign keys
  FOREIGN KEY (workshopId) REFERENCES workshops(id) ON DELETE SET NULL,
  FOREIGN KEY (sellerId) REFERENCES sellers(id) ON DELETE SET NULL
);

-- Agregar índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_expenses_workshop ON expenses(workshopId);
CREATE INDEX IF NOT EXISTS idx_expenses_seller ON expenses(sellerId);
CREATE INDEX IF NOT EXISTS idx_expenses_active ON expenses(isActive);
CREATE INDEX IF NOT EXISTS idx_expenses_created ON expenses(createdAt);

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla expenses creada exitosamente' as info;
DESCRIBE expenses; 