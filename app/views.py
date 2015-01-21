from flask import render_template

from app import app, db
from models import MovieRanking

@app.route('/')
@app.route('/index')
def index():
	data = "I'm data!!!"
	return render_template('index.html', data=data)
