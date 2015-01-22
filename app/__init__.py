import sqlite3
from flask import Flask, request, render_template, g, flash, url_for, redirect
from contextlib import closing
from datetime import datetime, date, timedelta

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
@app.route('/movies')
def index():
	"""Renders the index template."""
	cur = g.db.execute('select date, imdb_id, title_key, standard_title, rank from MovieRanking')
	data = [dict(date=row[0], imdb_id=row[1], title_key=row[2], standard_title=row[3], rank=row[4]) for row in cur.fetchall()]

	return render_template('index.html', data=data)

### database functions ###

def connect_db():
	"""Connects to the configured database."""
	return sqlite3.connect(app.config['DATABASE'])

# not actually needed - and in fact is dangerous - b/c we already have a db
# def init_db():
# 	"""Initializes the database with the provided schema."""
# 	with closing(connect_db()) as db:
# 		with app.open_resource('schema.sql', mode='r') as f:
# 			db.cursor().executescript(f.read())
# 		db.commit()
# 		print "Initialized the database."

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

if __name__ == '__main__':
	app.run()
