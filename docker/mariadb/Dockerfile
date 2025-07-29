FROM mariadb:10.6

# Configuración optimizada para producción
COPY my.cnf /etc/mysql/conf.d/custom.cnf

# Crear directorio para scripts de inicialización
RUN mkdir -p /docker-entrypoint-initdb.d

# Configurar permisos
RUN chown -R mysql:mysql /var/lib/mysql

EXPOSE 3306

CMD ["mysqld"] 