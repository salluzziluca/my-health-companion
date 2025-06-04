import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date

from models.weekly_diets import WeeklyDiets

def send_full_diet_email(patient_name: str, patient_email: str, week_start_date, meals_by_day: dict):
    subject = f"Nueva dieta semanal asignada - {week_start_date.strftime('%d/%m/%Y')}"
    body = f"¡Hola {patient_name} 👋!\n\n"
    body += "Acá está tu dieta semanal:\n\n"

    ordered_days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
    meal_order = {"breakfast": 0, "lunch": 1, "snack": 2, "dinner": 3}
    
    meals_by_day_str_keys = {day.value: meals for day, meals in meals_by_day.items()}

    for day in ordered_days:
        meals = meals_by_day_str_keys.get(day)
        if meals:
            day_name = day.capitalize()
            body += f"📅 {day_name}:\n"

            sorted_meals = sorted(
                meals_by_day_str_keys[day],
                key=lambda meal: meal_order.get(meal['meal_of_the_day'], 99)
            )

            for meal in sorted_meals:
                meal_type = meal['meal_name'].split()[0]
                meal_name = meal['meal_name'].replace(meal_type, '').strip()
                body += f"   - {meal_type}: {meal_name}\n"
            body += "\n"
    body += "La dieta también está disponible en la aplicación.\n\n"
    body += "Saludos,\nEl equipo de My Health Companion"

    send_email(to=patient_email, subject=subject, body=body.strip())

def send_email(to: str, subject: str, body: str):
    sender_email = "myhealthcompaniongdsi@gmail.com"
    sender_password = "scpb yyma bcoi uyul"

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to
    msg['Subject'] = subject

    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to, msg.as_string())
    except Exception as e:
        print(f"Error al enviar email: {e}")