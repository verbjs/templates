import Consul from 'consul';
import { logger } from './logger';

export interface ServiceConfig {
  id: string;
  name: string;
  address: string;
  port: number;
  protocols: string[];
  health: string;
  tags: string[];
  meta?: Record<string, string>;
}

export class ServiceRegistry {
  private consul: Consul.Consul;

  constructor(consulUrl: string) {
    this.consul = new Consul({ host: consulUrl });
  }

  async register(config: ServiceConfig): Promise<void> {
    try {
      await this.consul.agent.service.register({
        id: config.id,
        name: config.name,
        address: config.address,
        port: config.port,
        tags: [...config.tags, ...config.protocols],
        check: {
          http: config.health,
          interval: '10s',
          timeout: '5s'
        },
        meta: config.meta
      });
      
      logger.info(`Service ${config.name} registered with Consul`);
    } catch (error) {
      logger.error(`Failed to register service ${config.name}:`, error);
      throw error;
    }
  }

  async deregister(serviceId: string): Promise<void> {
    try {
      await this.consul.agent.service.deregister(serviceId);
      logger.info(`Service ${serviceId} deregistered from Consul`);
    } catch (error) {
      logger.error(`Failed to deregister service ${serviceId}:`, error);
      throw error;
    }
  }

  async discover(serviceName: string): Promise<ServiceConfig[]> {
    try {
      const result = await this.consul.health.service({
        service: serviceName,
        passing: true
      });
      
      return result.map(entry => ({
        id: entry.Service.ID,
        name: entry.Service.Service,
        address: entry.Service.Address,
        port: entry.Service.Port,
        protocols: entry.Service.Tags.filter(tag => 
          ['http', 'websocket', 'udp', 'tcp'].includes(tag)
        ),
        health: `http://${entry.Service.Address}:${entry.Service.Port}/health`,
        tags: entry.Service.Tags,
        meta: entry.Service.Meta
      }));
    } catch (error) {
      logger.error(`Failed to discover service ${serviceName}:`, error);
      throw error;
    }
  }
}