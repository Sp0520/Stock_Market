FROM php:8.2-apache

# Install Node.js (v18), NPM, curl, and PHP extensions
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install mysqli pdo pdo_mysql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite headers

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html/

# Run React build inside the container to compile client/dist
RUN npm run build

# Set proper permissions for Apache user
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Create logs directory with proper permissions
RUN mkdir -p /var/www/html/logs && chown www-data:www-data /var/www/html/logs && chmod 755 /var/www/html/logs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1