# Generated manually to fix message table structure

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0026_delete_paymenttest'),
    ]

    operations = [
        # Drop the old message table and related tables
        migrations.RunSQL(
            "DROP TABLE IF EXISTS students_message_delivered_to CASCADE;",
            reverse_sql="",
        ),
        migrations.RunSQL(
            "DROP TABLE IF EXISTS students_message_read_by CASCADE;",
            reverse_sql="",
        ),
        migrations.RunSQL(
            "DROP TABLE IF EXISTS students_messagereaction CASCADE;",
            reverse_sql="",
        ),
        migrations.RunSQL(
            "DROP TABLE IF EXISTS students_message CASCADE;",
            reverse_sql="",
        ),
        
        # Create the correct message table structure
        migrations.RunSQL(
            """
            CREATE TABLE students_message (
                id BIGSERIAL PRIMARY KEY,
                message TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                is_delivered BOOLEAN NOT NULL DEFAULT FALSE,
                is_seen BOOLEAN NOT NULL DEFAULT FALSE,
                chat_room_id BIGINT NOT NULL REFERENCES students_chatroom(id) ON DELETE CASCADE,
                sender_id INTEGER NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE
            );
            """,
            reverse_sql="DROP TABLE IF EXISTS students_message CASCADE;",
        ),
        
        # Create indexes for better performance
        migrations.RunSQL(
            "CREATE INDEX students_message_chat_room_id_idx ON students_message(chat_room_id);",
            reverse_sql="",
        ),
        migrations.RunSQL(
            "CREATE INDEX students_message_sender_id_idx ON students_message(sender_id);",
            reverse_sql="",
        ),
    ]
