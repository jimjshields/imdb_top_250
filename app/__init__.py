from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

# create flask object
app = Flask(__name__)
# config from config module
app.config.from_object('config')
# initialize db w/ sqlalchemy
db = SQLAlchemy(app)

from app import views, models