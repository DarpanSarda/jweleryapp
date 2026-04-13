#!/bin/bash

# vezura E-commerce Database Migration Script
# This script helps you run database migrations easily

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="vezura_db"
DB_USER="root"
DB_HOST="localhost"
MIGRATIONS_DIR="$(dirname "$0")/migrations"

# Parse command line arguments
DB_TYPE=${1:-sqlite}  # Default to SQLite
DB_FILE="${2:-database/vezura.db}"

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}vezura Database Migration Script${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""

# Function to show usage
show_usage() {
    echo "Usage: ./migrate.sh [db_type] [db_file_or_name]"
    echo ""
    echo "Arguments:"
    echo "  db_type      : sqlite, mysql, or postgresql (default: sqlite)"
    echo "  db_file_name : For SQLite: path to .db file (default: database/vezura.db)"
    echo "                For MySQL: database name (default: vezura_db)"
    echo ""
    echo "Examples:"
    echo "  ./migrate.sh sqlite              # Use SQLite with default database"
    echo "  ./migrate.sh sqlite mydb.db      # Use SQLite with custom database"
    echo "  ./migrate.sh mysql              # Use MySQL with default database"
    echo "  ./migrate.sh postgresql         # Use PostgreSQL"
    exit 1
}

# Check if help is requested
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_usage
fi

# Function to run SQLite migrations
run_sqlite() {
    local db_file="$1"

    echo -e "${YELLOW}Running SQLite migrations...${NC}"
    echo -e "Database file: ${GREEN}$db_file${NC}"
    echo ""

    # Create database directory if it doesn't exist
    mkdir -p "$(dirname "$db_file")"

    # Run migrations
    for migration in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration" ]; then
            migration_name=$(basename "$migration")
            echo -e "${GREEN}Running migration: $migration_name${NC}"

            # Skip MySQL specific migrations for SQLite
            if [[ "$migration_name" == *"_mysql.sql" ]]; then
                echo -e "${YELLOW}Skipping MySQL-specific migration${NC}"
                continue
            fi

            sqlite3 "$db_file" < "$migration"

            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Migration completed successfully${NC}"
            else
                echo -e "${RED}✗ Migration failed${NC}"
                exit 1
            fi
            echo ""
        fi
    done

    echo -e "${GREEN}All SQLite migrations completed!${NC}"
}

# Function to run MySQL migrations
run_mysql() {
    local db_name="$1"

    echo -e "${YELLOW}Running MySQL migrations...${NC}"
    echo -e "Database: ${GREEN}$db_name${NC}"
    echo -e "User: ${GREEN}$DB_USER${NC}"
    echo ""

    # Check if MySQL is available
    if ! command -v mysql &> /dev/null; then
        echo -e "${RED}Error: mysql command not found${NC}"
        echo "Please install MySQL client first"
        exit 1
    fi

    # Prompt for password
    echo -n "Enter MySQL password for user '$DB_USER': "
    read -s DB_PASSWORD
    echo ""

    # Run MySQL specific schema first
    echo -e "${GREEN}Creating MySQL database and schema...${NC}"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" < "$MIGRATIONS_DIR/001_initial_schema_mysql.sql"

    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ MySQL schema migration failed${NC}"
        exit 1
    fi

    # Run seed data (skip MySQL schema file)
    for migration in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration" ]; then
            migration_name=$(basename "$migration")

            # Skip schema files as they've been run
            if [[ "$migration_name" == *"_mysql.sql" ]] || [[ "$migration_name" == "001_"* ]]; then
                continue
            fi

            echo -e "${GREEN}Running migration: $migration_name${NC}"

            # Convert JSON strings for MySQL
            sed "s/'/\\'/g; s/JSON/JSON/g" "$migration" | mysql -u"$DB_USER" -p"$DB_PASSWORD" "$db_name"

            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Migration completed successfully${NC}"
            else
                echo -e "${RED}✗ Migration failed${NC}"
                exit 1
            fi
        fi
    done

    echo -e "${GREEN}All MySQL migrations completed!${NC}"
}

# Function to run PostgreSQL migrations
run_postgresql() {
    echo -e "${YELLOW}Running PostgreSQL migrations...${NC}"
    echo -e "Database: ${GREEN}$DB_NAME${NC}"
    echo ""

    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}Error: psql command not found${NC}"
        echo "Please install PostgreSQL client first"
        exit 1
    fi

    # Note: PostgreSQL migrations require manual conversion
    echo -e "${YELLOW}Note: PostgreSQL migrations require some manual adjustments${NC}"
    echo -e "Please convert the SQL files to PostgreSQL syntax and run manually"
    echo ""
    echo "Required changes:"
    echo "  - AUTOINCREMENT → SERIAL"
    echo "  "TIMESTAMP → TIMESTAMPTZ""
    echo "  - Use \$\$ for JSON strings or ::jsonb cast"
    echo ""
    echo "Example:"
    echo "  psql -U postgres -d vezura_db -f migrations/001_initial_schema_postgresql.sql"

    exit 1
}

# Main logic
case "$DB_TYPE" in
    sqlite)
        run_sqlite "$DB_FILE"
        ;;
    mysql)
        run_mysql "$DB_NAME"
        ;;
    postgresql|postgres)
        run_postgresql
        ;;
    *)
        echo -e "${RED}Error: Unknown database type '$DB_TYPE'${NC}"
        echo ""
        show_usage
        ;;
esac

echo ""
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Migration Complete!${NC}"
echo -e "${GREEN}==================================${NC}"
