import sqlite3
from flask import Flask, request, render_template, g, flash, url_for, redirect
from contextlib import closing
from datetime import datetime, date, timedelta
import json

# configuration - figure out later how to port into separate file
DATABASE = 'app.db'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'

app = Flask(__name__)
app.config.from_object(__name__)

### url routing/view functions ###

@app.route('/')
def index():
	"""Renders the index template."""
	return render_template("index.html", data="testing")

@app.route('/movies')
def show_movies():
	"""Renders the data from the MovieRanking table."""

	cur = g.db.execute('select date, title_key, standard_title, rank  from MovieRanking where rank < ?', [100])
	data = json.dumps([dict(date=row[0], title_key=row[1], standard_title=row[2], rank=row[3]) for row in cur.fetchall()])

	return render_template('index.html', data=data)

### database functions ###

def connect_db():
	"""Connects to the configured database."""
	return sqlite3.connect(app.config['DATABASE'])

def init_db():
	"""Initializes the database with the provided schema."""
	with closing(connect_db()) as db:
		with app.open_resource('schema.sql', mode='r') as f:
			db.cursor().executescript(f.read())
		db.commit()
		print "Initialized the database."

@app.before_request
def before_request():
	"""Before the db request, connects to the database."""
	g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
	"""After the db request, closes the connection,
	   and handles any exceptions."""
	db = getattr(g, 'db', None)
	if db is not None:
		db.close()

### utility functions ###

def stringify_date(date):
	return date.strftime('%m-%d-%Y')

if __name__ == '__main__':
	app.run()
