import { Model, ModelStatic, Op } from 'sequelize';
import { BaseRepository } from './base-repository.interface';

export class GenericRepository<T extends Model, ID> implements BaseRepository<T, ID> {
  protected model: ModelStatic<T>;
  
  constructor(model: ModelStatic<T>) {
    this.model = model;
  }
  
  async findById(id: ID): Promise<T | null> {
    return this.model.findByPk(id as any) as Promise<T | null>;
  }
  
  async findAll(filters?: any): Promise<T[]> {
    return this.model.findAll({
      where: filters || {}
    }) as Promise<T[]>;
  }

  async create(data: Partial<T>, options?: any): Promise<T> {
    return this.model.create(data as any, options) as unknown as Promise<T>;
  }
  
  async update(id: ID, data: Partial<T>, options?: any): Promise<T | null> {
    const instance = await this.findById(id);
    if (!instance) return null;

    return (await instance.update(data, options)) as T;
  }
  
  // Soft delete
  async delete(id: ID, options?: any): Promise<boolean> {
    const deleted = await this.model.destroy({
      where: { id: id as any },
      ...options
    });
    return deleted > 0;
  }

    // Hard delete when needed
  async hardDelete(id: ID, options?: any): Promise<boolean> {
    const deleted = await this.model.destroy({
      where: { id: id as any },
      force: true, // Actually delete the record
      ...options
    });
    return deleted > 0;
  }
  
  // Restore a soft-deleted record
  async restore(id: ID, options?: any): Promise<T | null> {
    const instance = await this.model.findByPk(id as any, { paranoid: false });
    if (!instance) return null;
    
    await instance.restore(
      options
    );
    return instance;
  }
  
  // Find including soft-deleted records
  async findAllWithDeleted(filters?: any): Promise<T[]> {
    return this.model.findAll({
      where: filters || {},
      paranoid: false
    }) as Promise<T[]>;
  }
  
  // Find only soft-deleted records
  async findOnlyDeleted(filters?: any): Promise<T[]> {
    return this.model.findAll({
      where: {
        ...filters,
        deletedAt: { [Op.ne]: null }
      },
      paranoid: false
    }) as Promise<T[]>;
  }
}