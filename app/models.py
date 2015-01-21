# from the app module, import the db object (a sqlalchemy object)
from app import db

class MovieRanking(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	rank = db.Column(db.Integer, index=True)
	movie = db.Column(db.String(140), index=True)
	date = db.Column(db.Date)

	def __repr__(self):
		return '<Movie %r was Rank %r on Date %r>' % (self.movie, self.rank, self.date)