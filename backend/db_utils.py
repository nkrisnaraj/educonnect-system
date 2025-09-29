"""
Database utility functions for EduConnect backend
Provides connection testing and fallback mechanisms for Supabase database
"""
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from django.core.management.color import color_style
import time

style = color_style()

def test_database_connection(database_url=None, timeout=10):
    """
    Test database connection with the given database URL
    
    Args:
        database_url (str): PostgreSQL connection string
        timeout (int): Connection timeout in seconds
        
    Returns:
        tuple: (success: bool, message: str, connection_info: dict)
    """
    if not database_url:
        database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        return False, "DATABASE_URL not found in environment", {}
    
    try:
        # Parse the database URL to extract connection info
        if database_url.startswith('postgresql://'):
            # Extract connection details for reporting
            import urllib.parse
            parsed = urllib.parse.urlparse(database_url)
            connection_info = {
                'host': parsed.hostname,
                'port': parsed.port,
                'database': parsed.path[1:] if parsed.path.startswith('/') else parsed.path,
                'username': parsed.username
            }
        else:
            connection_info = {'raw_url': database_url}
        
        # Test the connection
        conn = psycopg2.connect(
            database_url,
            connect_timeout=timeout,
            application_name='EduConnect-Health-Check'
        )
        
        # Test with a simple query
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        connection_info['db_version'] = db_version
        return True, "Database connection successful", connection_info
        
    except psycopg2.OperationalError as e:
        error_msg = str(e).strip()
        if "could not translate host name" in error_msg:
            return False, f"DNS resolution failed: {error_msg}", connection_info
        elif "server closed the connection unexpectedly" in error_msg:
            return False, f"Server connection issue: {error_msg}", connection_info
        elif "timeout" in error_msg.lower():
            return False, f"Connection timeout: {error_msg}", connection_info
        else:
            return False, f"Database connection error: {error_msg}", connection_info
    except Exception as e:
        return False, f"Unexpected error: {str(e)}", connection_info

def get_alternative_database_urls():
    """
    Get alternative database connection URLs for fallback
    
    Returns:
        list: List of alternative database URLs to try
    """
    alternatives = []
    
    # Original URL with connection pooler
    original_url = os.getenv("DATABASE_URL")
    if original_url:
        alternatives.append(("Primary (Pooler)", original_url))
    
    # Direct connection (bypass pooler) - replace pooler port 6543 with direct port 5432
    if original_url and "pooler.supabase.com:6543" in original_url:
        direct_url = original_url.replace("pooler.supabase.com:6543", "supabase.co:5432")
        alternatives.append(("Direct Connection", direct_url))
    
    # You can add more fallback databases here if needed
    # For example, a local PostgreSQL instance for development:
    # alternatives.append(("Local Development", "postgresql://postgres:password@localhost:5432/educonnect"))
    
    return alternatives

def find_working_database():
    """
    Try multiple database connections and return the first working one
    
    Returns:
        tuple: (working_url: str, connection_name: str, test_result: dict)
    """
    alternatives = get_alternative_database_urls()
    
    print(style.WARNING("Testing database connections..."))
    
    for name, url in alternatives:
        print(f"Testing {name}...")
        success, message, info = test_database_connection(url, timeout=5)
        
        if success:
            print(style.SUCCESS(f"✓ {name} connection successful!"))
            print(f"  Host: {info.get('host', 'unknown')}")
            print(f"  Port: {info.get('port', 'unknown')}")
            print(f"  Database: {info.get('database', 'unknown')}")
            return url, name, {'success': True, 'message': message, 'info': info}
        else:
            print(style.ERROR(f"✗ {name} failed: {message}"))
    
    return None, None, {'success': False, 'message': 'No working database connection found'}

def check_database_health():
    """
    Comprehensive database health check
    
    Returns:
        dict: Health check results
    """
    print(style.HTTP_INFO("=== EduConnect Database Health Check ==="))
    
    # Test current configuration
    working_url, connection_name, result = find_working_database()
    
    if working_url:
        print(style.SUCCESS(f"\n✓ Working database found: {connection_name}"))
        
        # If it's not the primary URL, suggest updating the environment
        original_url = os.getenv("DATABASE_URL")
        if working_url != original_url:
            print(style.WARNING(f"\n⚠️  Consider updating DATABASE_URL to use the working connection:"))
            print(f"   DATABASE_URL={working_url}")
            
        return {
            'status': 'healthy',
            'working_url': working_url,
            'connection_name': connection_name,
            'recommendation': 'Database is accessible' if working_url == original_url else 'Update DATABASE_URL environment variable'
        }
    else:
        print(style.ERROR(f"\n✗ No working database connection found"))
        print(style.HTTP_INFO("\nTroubleshooting steps:"))
        print("1. Check your internet connection")
        print("2. Verify Supabase project is active and not paused")
        print("3. Check if Supabase service is experiencing outages")
        print("4. Verify database credentials are correct")
        print("5. Try connecting directly via Supabase dashboard")
        
        return {
            'status': 'unhealthy',
            'working_url': None,
            'connection_name': None,
            'recommendation': 'Check network connectivity and Supabase service status'
        }

if __name__ == "__main__":
    # Run health check when script is executed directly
    check_database_health()