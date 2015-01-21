from flask import Flask

# create flask object
app = Flask(__name__)
# config from config module
app.config.from_object('config')

from app import views