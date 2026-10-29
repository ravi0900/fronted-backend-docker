from flask import Flask, jsonify, request
import json
import os
import re
app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4000)
