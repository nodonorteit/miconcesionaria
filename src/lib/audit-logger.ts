import { prisma } from './prisma'
import { NextRequest } from 'next/server'

export interface LogData {
  action: string
  entity: string
  entityId: string
  description: string
  oldData?: any
  newData?: any
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
}

export class AuditLogger {
  static async log(logData: LogData): Promise<void> {
    try {
      await prisma.systemLog.create({
        data: {
          action: logData.action,
          entity: logData.entity,
          entityId: logData.entityId,
          description: logData.description,
          oldData: logData.oldData ? JSON.stringify(logData.oldData) : null,
          newData: logData.newData ? JSON.stringify(logData.newData) : null,
          userId: logData.userId,
          userEmail: logData.userEmail,
          ipAddress: logData.ipAddress,
          userAgent: logData.userAgent
        }
      })
      console.log(`📝 [AUDIT] ${logData.action} ${logData.entity} ${logData.entityId}: ${logData.description}`)
    } catch (error) {
      console.error('❌ Error creating audit log:', error)
      // No lanzar error para que no afecte la operación principal
    }
  }

  static async logFromRequest(
    request: NextRequest,
    logData: Omit<LogData, 'ipAddress' | 'userAgent'>
  ): Promise<void> {
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await this.log({
      ...logData,
      ipAddress,
      userAgent
    })
  }

  // Métodos específicos para diferentes entidades
  static async logVehicleAction(
    action: string,
    vehicleId: string,
    description: string,
    oldData?: any,
    newData?: any,
    userId?: string,
    userEmail?: string
  ): Promise<void> {
    await this.log({
      action,
      entity: 'VEHICLE',
      entityId: vehicleId,
      description,
      oldData,
      newData,
      userId,
      userEmail
    })
  }

  static async logSaleAction(
    action: string,
    saleId: string,
    description: string,
    oldData?: any,
    newData?: any,
    userId?: string,
    userEmail?: string
  ): Promise<void> {
    await this.log({
      action,
      entity: 'SALE',
      entityId: saleId,
      description,
      oldData,
      newData,
      userId,
      userEmail
    })
  }

  static async logCustomerAction(
    action: string,
    customerId: string,
    description: string,
    oldData?: any,
    newData?: any,
    userId?: string,
    userEmail?: string
  ): Promise<void> {
    await this.log({
      action,
      entity: 'CUSTOMER',
      entityId: customerId,
      description,
      oldData,
      newData,
      userId,
      userEmail
    })
  }

  static async logExpenseAction(
    action: string,
    expenseId: string,
    description: string,
    oldData?: any,
    newData?: any,
    userId?: string,
    userEmail?: string
  ): Promise<void> {
    await this.log({
      action,
      entity: 'EXPENSE',
      entityId: expenseId,
      description,
      oldData,
      newData,
      userId,
      userEmail
    })
  }
}

// Función helper para obtener información del usuario desde el request
export function getUserInfoFromRequest(request: NextRequest) {
  // En un sistema real, esto vendría del token JWT o sesión
  // Por ahora retornamos valores por defecto
  return {
    userId: 'system',
    userEmail: 'system@miconcesionaria.com'
  }
}
