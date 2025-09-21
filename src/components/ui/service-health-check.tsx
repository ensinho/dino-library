/**
 * Service Health Check Component
 * 
 * This component monitors the health status of all microservices
 * and provides visual feedback to users and administrators.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiGateway } from '@/services/apiGateway';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'down' | 'unknown' | 'checking';
  lastChecked?: string;
  responseTime?: number;
  error?: string;
}

export function ServiceHealthCheck() {
  const { t } = useTranslation();
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    initializeServices();
    checkAllServices();
    
    // Check health every 30 seconds
    const interval = setInterval(checkAllServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeServices = () => {
    const serviceNames = apiGateway.getServiceNames();
    const initialServices: ServiceHealth[] = serviceNames.map(name => ({
      name,
      status: 'unknown',
      lastChecked: undefined,
      responseTime: undefined
    }));
    setServices(initialServices);
  };

  const checkAllServices = async () => {
    setIsChecking(true);
    const startTime = Date.now();

    try {
      const healthResults = await apiGateway.getServicesHealth();
      
      setServices(prevServices => 
        prevServices.map(service => {
          const isHealthy = healthResults[service.name];
          return {
            ...service,
            status: isHealthy ? 'healthy' : 'down',
            lastChecked: new Date().toISOString(),
            responseTime: Date.now() - startTime,
            error: isHealthy ? undefined : 'Service unavailable'
          };
        })
      );

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      setServices(prevServices => 
        prevServices.map(service => ({
          ...service,
          status: 'down',
          lastChecked: new Date().toISOString(),
          error: 'Health check failed'
        }))
      );
    } finally {
      setIsChecking(false);
    }
  };

  const checkSingleService = async (serviceName: string) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service.name === serviceName 
          ? { ...service, status: 'checking' }
          : service
      )
    );

    const startTime = Date.now();
    try {
      const isHealthy = await apiGateway.isServiceHealthy(serviceName);
      
      setServices(prevServices => 
        prevServices.map(service => 
          service.name === serviceName 
            ? {
                ...service,
                status: isHealthy ? 'healthy' : 'down',
                lastChecked: new Date().toISOString(),
                responseTime: Date.now() - startTime,
                error: isHealthy ? undefined : 'Service unavailable'
              }
            : service
        )
      );
    } catch (error) {
      setServices(prevServices => 
        prevServices.map(service => 
          service.name === serviceName 
            ? {
                ...service,
                status: 'down',
                lastChecked: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            : service
        )
      );
    }
  };

  const getStatusIcon = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'down':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ServiceHealth['status']) => {
    const variants = {
      healthy: 'default',
      down: 'destructive',
      checking: 'secondary',
      unknown: 'outline'
    } as const;

    const labels = {
      healthy: t('services.healthy'),
      down: t('services.down'),
      checking: 'Checking...',
      unknown: t('services.unknown')
    };

    return (
      <Badge variant={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status]}</span>
      </Badge>
    );
  };

  const getOverallStatus = () => {
    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const downCount = services.filter(s => s.status === 'down').length;
    const totalCount = services.length;

    if (downCount === 0 && healthyCount === totalCount) {
      return { status: 'healthy', message: 'All services are operational' };
    } else if (downCount === totalCount) {
      return { status: 'down', message: 'All services are down' };
    } else {
      return { 
        status: 'partial', 
        message: `${healthyCount}/${totalCount} services operational` 
      };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {overallStatus.status === 'healthy' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {overallStatus.status === 'down' && <XCircle className="w-5 h-5 text-red-500" />}
                {overallStatus.status === 'partial' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                {t('services.status')}
              </CardTitle>
              <CardDescription>
                {overallStatus.message}
                {lastUpdate && (
                  <span className="text-xs text-muted-foreground ml-2">
                    • Last updated: {lastUpdate}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkAllServices}
              disabled={isChecking}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {overallStatus.status === 'down' && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Services are currently unavailable. The application will automatically fall back to direct database access.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <Tooltip key={service.name}>
                <TooltipTrigger asChild>
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => checkSingleService(service.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">
                          {t(`services.${service.name}`, service.name)}
                        </h4>
                        {getStatusIcon(service.status)}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(service.status)}
                        
                        {service.responseTime && service.status === 'healthy' && (
                          <span className="text-xs text-muted-foreground">
                            {service.responseTime}ms
                          </span>
                        )}
                        
                        {service.error && (
                          <span className="text-xs text-red-500 line-clamp-2">
                            {service.error}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                
                <TooltipContent>
                  <div className="text-sm">
                    <p><strong>{service.name} Service</strong></p>
                    <p>Status: {service.status}</p>
                    {service.lastChecked && (
                      <p>Last checked: {new Date(service.lastChecked).toLocaleTimeString()}</p>
                    )}
                    {service.responseTime && (
                      <p>Response time: {service.responseTime}ms</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to check this service
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              • Services are checked automatically every 30 seconds
            </p>
            <p>
              • Click on any service card to manually check its status
            </p>
            <p>
              • When services are down, the app falls back to direct database access
            </p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default ServiceHealthCheck;