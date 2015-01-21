# for creating paths
import os
basedir = os.path.abspath(os.path.dirname(__file__))

# path to the db sqlalchemy will use
SQLALCHEMY_DATABASE_URI = 'sqlite:///%s' % (os.path.join(basedir, 'app.db'))
# path to the repo folder of migrate data files sqlalchemy will use
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')