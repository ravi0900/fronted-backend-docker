from flask import Flask, jsonify, request
import json
import math
import os
import re
from dotenv import load_dotenv
import pymongo

load_dotenv()

app = Flask(__name__)

client = pymongo.MongoClient(os.getenv('URI'))
db= client.test
collection = db['student_grades_db']
todo_collection = db['todo_items']

@app.route('/')
def home():
    return "Welcome to the Student Grade API!"

@app.route('/api')
def get_student_grades():
    dict_student_grade = {
        "Anjali": 90,
        "Ravi": 80,
        "Ramesh": 70,
        "Suresh": 60
    }
    with open(os.path.join(os.path.dirname(__file__), 'student_grade.json'), encoding='utf-8') as grade_file:
        student_grade_data = json.load(grade_file)
    student_grade_data.update(dict_student_grade)
    return jsonify(student_grade_data)

@app.route('/view')
def view_student_grades():
    students = list(collection.find({}, {'_id': 0}))
    return jsonify({
        "students": students,
    })

@app.route('/submit', methods=['POST'])
def submit_student_grade():
    form_data = request.get_json()
    # print(form_data)
    email = str(form_data.get('email', '')).strip()
    if collection.find_one({'email': {'$regex': f'^{re.escape(email)}$', '$options': 'i'}}):
        return jsonify({"message": "This email has already been submitted."}), 409
    collection.insert_one(form_data)
    return jsonify({"message": "Data submitted successfully!"})
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4000)
