# from the app module, import the db object (a sqlalchemy object)
from app import db

class MovieRanking(db.Model):
	# using pandas - created a table directly from the csv
	# data types assigned automatically

	index = db.Column(db.Integer, primary_key=True)
	rank = db.Column(db.Integer)
  	imdb_rating = db.Column(db.Float)
  	took_url = db.Column(db.String)
  	title = db.Column(db.String)
  	num_votes = db.Column(db.Integer)
  	took_date_url = db.Column(db.String)
  	date = db.Column(db.String)
  	imdb_id = db.Column(db.String)
  	title_key = db.Column(db.String)
  	standard_title = db.Column(db.String)

	def __repr__(self):
		return '<Movie %r was Rank %r on Date %r>' % (self.standard_title, self.rank, self.date)

	# prior to using pandas
	# id = db.Column(db.Integer, primary_key=True)
	# rank = db.Column(db.Integer, index=True)
	# movie = db.Column(db.String(140), index=True)
	# date = db.Column(db.Date)