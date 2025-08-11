export interface DocumentTemplate {
  id?: string
  name: string
  type: string
  content: string
  variables: any
  isActive: boolean
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

export interface DocumentTemplateWithTimestamps extends DocumentTemplate {
  id: string
  createdAt: string
  updatedAt: string
} 