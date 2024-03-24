from flask import Flask, request, render_template, jsonify, url_for
from openai import OpenAI
from collections import defaultdict
import re
import csv
import io
import smtplib
from email.message import EmailMessage
from datetime import datetime, timedelta
import requests
import os

app = Flask(__name__)

# Directly setting your OpenAI API key
client = OpenAI(api_key="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")


def email_alert(subject, body, to):
    msg = EmailMessage()
    msg.set_content(body)
    msg['subject'] = subject
    msg['to'] = to

    user = "karthikn9883@gmail.com"  # Replace with your actual Gmail address
    msg['from'] = user
    password = "vxzc cmck myve yzes"  # Replace with your actual Gmail app password

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(user, password)
    server.send_message(msg)

    server.quit()


def get_current_weather(api_key, location='New York'):
    """Fetch the current weather data."""
    url = f'http://api.weatherapi.com/v1/current.json?key={api_key}&q={location}'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        temp_c = data['current']['temp_c']
        condition_text = data['current']['condition']['text'].lower()
        return temp_c, condition_text
    else:
        return None, None


def parse_csv(file_stream):
    student_info = {}
    classes = []
    text_stream = io.StringIO(file_stream.read().decode('utf-8'), newline=None)
    reader = csv.reader(text_stream)
    section = None
    for row in reader:
        if not row:
            continue
        if row[0].startswith('Student Information'):
            section = 'student'
        elif row[0].startswith('Classes & Schedule'):
            section = 'classes'
        elif section == 'student' and len(row) > 1:
            student_info[row[0]] = row[1]
        elif section == 'classes' and row[0] != 'Class ID':
            class_info = {
                'Class ID': row[0],
                'Class Name': row[1],
                'Instructor': row[2],
                'Schedule': row[3],
                'Room': row[4],
                'Midterm Date': row[5],
                'Midterm Time': row[6],
                'Midterm Room': row[7],
                'Midterm Difficulty': row[8],
            }
            classes.append(class_info)
    return student_info, classes


def schedule_notifications(classes):
    threshold_date = datetime.strptime('03/30/2024', '%m/%d/%Y')
    emails_to_send = 2  # The number of emails to send

    for class_info in classes:
        midterm_date = datetime.strptime(class_info['Midterm Date'], '%m/%d/%Y')
        difficulty = int(class_info['Midterm Difficulty'])

        # Check if the midterm is within 10 days before the threshold date
        # and the difficulty is 5
        if midterm_date <= threshold_date and midterm_date >= threshold_date - timedelta(
                days=10) and difficulty == 5:
            subject = f"Reminder for {class_info['Class Name']}"
            body = f"Your midterm is on {class_info['Midterm Date']}. It's time to start preparing!"
            recipient = "pperepa9@gmail.com"  # Replace with the recipient's email
            email_alert(subject, body, recipient)
            emails_to_send -= 1

            if emails_to_send == 0:
                break


def categorize_and_summarize_transactions(transaction_history):
    # Define categories for simplicity; expand as needed
    categories = {
        'Food': ['Coffee Shop', 'Grocery Store', 'Dinner at Restaurant', 'Breakfast at Diner',
                 'Lunch at Fast Food Restaurant'],
        'Utilities': ['Utility Bill Payment'],
        'Health': ['Pharmacy', 'Health Insurance Payment'],
        'Transport': ['Gas Station'],
        'Insurance': ['Car Insurance Payment'],
        'Entertainment': ['Online Subscription Renewal', 'Movie Rental', 'Movie Theater'],
        'Personal Care': ['Hair Salon', 'Gym Membership Fee'],
        'Miscellaneous': ['Online Shopping', 'ATM Withdrawal']
    }

    # Regex to parse transaction entries
    entry_pattern = re.compile(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2} (AM|PM) - ([^-$]+) - \$(\d+\.\d{2})")
    transactions = entry_pattern.findall(transaction_history)

    # Summarize spending by category
    spending_summary = defaultdict(float)
    for _, category_desc, amount in transactions:
        for category, keywords in categories.items():
            if any(keyword in category_desc for keyword in keywords):
                spending_summary[category] += float(amount)
                break
        else:  # For transactions that don't match any category
            spending_summary['Miscellaneous'] += float(amount)

    return spending_summary


def calculate_time_to_goal(savings_plan, goals):
    time_to_goals = {}
    for goal in goals:
        # Assuming savings_plan provides monthly savings towards each goal
        monthly_savings = savings_plan.get(goal['name'], 0)
        if monthly_savings <= 0:
            time_to_goals[goal['name']] = float('inf')  # If monthly savings is 0 or not provided, set time to infinity
        else:
            months_needed = goal['amount'] / monthly_savings
            time_to_goals[goal['name']] = months_needed
    return time_to_goals


@app.route('/')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/welcome')
def welcome():
    return render_template('welcome.html')

@app.route('/form')
def form():
    # Add any necessary logic here
    return render_template('form.html')


@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files.get('file')
        if file and file.filename != '':
            student_info, classes = parse_csv(file)
            schedule_notifications(classes)
            return render_template('schedule_display.html', student_info=student_info, classes=classes)
        else:
            return "No file selected or file is empty."
    return render_template('upload.html')

@app.route('/health')
def health():
    return render_template('health.html')

@app.route('/clothing')
def clothing():
    api_key_1 = '2181a0fa1cd9454894b95729242403'
    temp_c, condition_text = get_current_weather(api_key_1, 'Austin')

    # Define your image filenames for top and bottom clothing items
    clothing_options = {
        'rain': ('snowjacket.png', 'bluejeans.png'),  # For rain
        'cold': ('bigjacket.png', 'bluejeans.png'),   # For cold weather
        'mild': ('blackhoodie.png', 'bluejeans.png'), # For mild weather
        'warm': ('whiteshirt.png', 'bluejeans.png'),  # For warm weather
        'hot': ('whiteshirt.png', 'yshorts.png'),     # For hot weather
    }

    # Replace this logic with actual condition checks
    if 'rain' in condition_text:
        top_image, bottom_image = clothing_options['rain']
    elif temp_c < 10:  # Example condition for cold weather
        top_image, bottom_image = clothing_options['cold']
    elif 10 <= temp_c <= 20:  # Example condition for mild weather
        top_image, bottom_image = clothing_options['mild']
    elif temp_c > 20:  # Example condition for warm weather
        top_image, bottom_image = clothing_options['warm']
    else:  # Example condition for hot weather
        top_image, bottom_image = clothing_options['hot']

    top_image_path = url_for('static', filename=top_image)      # Path for top clothing item image
    bottom_image_path = url_for('static', filename=bottom_image) # Path for bottom clothing item image

    return render_template('clothing.html', temp_c=temp_c, condition_text=condition_text,
                           top_image_path=top_image_path, bottom_image_path=bottom_image_path)


@app.route('/generate-insights', methods=['POST'])
def generate_insights():
    monthly_income = request.form['monthly_income']
    monthly_spending = request.form['monthly_spending']
    goals = [{
        "name": request.form['goal_name'],
        "amount": int(request.form['goal_amount']),
        "priority": int(request.form['goal_priority'])
    }]

    # Transaction history (simplified for example)
    transaction_history = """
    2024-03-01 08:15 AM - Coffee Shop - $4.50
    2024-03-01 12:30 PM - Grocery Store - $68.25
    # Remaining transaction history...
    """.strip()

    # Use the new function to categorize and summarize transactions
    spending_summary = categorize_and_summarize_transactions(transaction_history)

    time_to_goals = calculate_time_to_goal(spending_summary, goals)

    # Create a summary string from the spending_summary for the prompt
    summary_lines = [f"- Total spent on {category}: ${amount:.2f}" for category, amount in spending_summary.items()]

    summary = "\n".join(summary_lines)

    formatted_goals = "\n".join([f"- {goal['name']} needs ${goal['amount']}, priority {goal['priority']}" for goal in goals])

    personalized_lines = [
        f"To achieve your goal of '{goal['name']}' which is a priority {goal['priority']} goal, "
        f"you need to save ${goal['amount']} total. "
        f"At your current savings rate, you will achieve this goal in {time_to_goals[goal['name']]} months."
        for goal in goals
    ]
    personalized_response = "\n".join(personalized_lines)

    prompt = f"""
    Given a monthly income of ${monthly_income} and monthly expenses totaling ${monthly_spending}, 
    here is a summary of monthly expenses by category:
    {summary}

    Here are the financial goals:
    {formatted_goals}

    {personalized_response}

    Based on the summary above and considering the savings required for each goal, 
    can you suggest specific and personalized strategies for the user to optimize their spending?
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an AI assistant designed to provide personalized resource recommendations to users based on their specific needs and preferences. To accomplish this, you should: Analyze user responses to a set of questionnaire prompts that assess their project requirements, personal preferences, and skill level. Interpret any additional documents uploaded by the users that may provide further context on their requirements. Use the information from the questionnaire and documents to filter and recommend the most suitable resources in the end_user_tools.txt document. These resources could include software tools, articles, tutorials, and more. When providing recommendations, explain why each resource is suitable based on the information provided by the user. Maintain user privacy by not storing or sharing any personal information. If you encounter ambiguous queries or insufficient data, ask follow-up questions to gather the necessary details for accurate recommendations. Continuously learn from user feedback to improve the relevance and quality of your recommendations over time. Remember, your primary goal is to act as a helpful assistant, guiding users to the tools and information they need to be successful in their projects or learning endeavors."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,  # Adjusted for more deterministic outputs
        max_tokens=1024,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    insight = response.choices[0].message.content if response.choices else "No insight generated."
    insights_list = insight.split("\n")
    insights_list = [i for i in insights_list if i]
    insights_list.append(personalized_response)
    return render_template('output.html', insights_list=insights_list)


@app.route('/output')
def output():
    # Replace with the actual method to retrieve your insights_list
    insights_list = []  # This should be populated with actual insights
    return render_template('output.html', insights_list=insights_list)


if __name__ == '__main__':
    app.run(debug=True, port=5001)