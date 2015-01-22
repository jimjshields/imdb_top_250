# for the took 250 site
from unidecode import unidecode
import urllib
import csv
from bs4 import BeautifulSoup
import datetime
from time import gmtime, strftime
import sys

def replaceBadChar(string):
    try:
        return unidecode(string)
    except:
        return string

# start a new dataTable
dataTable = []

# for printing to the terminal
counter = 0

# year = sys.argv[1]

# one loop through all of the years, months, days
for year in range(2005, 2015):
    for month in range(1, 13):
        for day in range(1, 32):
            url = "http://www.took.nl/250/history/%s/%d/%d/compare/full" % (year, month, day)
            date = "%d/%d/%s" % (month, day, year)
    # url = "http://www.took.nl/250/history/1996/11/19/compare/full"
            bs = BeautifulSoup(urllib.urlopen(url).read())
            try:
                for row in bs('table')[-4].findAll('tr'):
                    tds = row('td')
                    if tds:
                        # print replaceBadChar(tds[0].b.string)
                        # if tds[2].string:
                        #     print replaceBadChar(tds[2].string.strip())
                        # else:
                        #     print replaceBadChar(tds[2].span.string.strip())
                        # print replaceBadChar(tds[3].span.a['href'])
                        # print replaceBadChar(tds[3].span.a.string)
                        # print replaceBadChar(tds[4].span.string)
                        movie_data = []
                        movie_data.append(replaceBadChar(tds[0].b.string))
                        if tds[2].string:
                            movie_data.append(replaceBadChar(tds[2].string.strip()))
                        else:
                            movie_data.append(replaceBadChar(tds[2].span.string.strip()))
                        movie_data.append(replaceBadChar(tds[3].span.a['href']))
                        movie_data.append(replaceBadChar(tds[3].span.a.string))
                        movie_data.append(replaceBadChar(tds[4].span.string))
                        movie_data.append(url)
                        movie_data.append(date)
                        dataTable.append(movie_data)
                print str(counter) + ': ' + date + ' worked'
                # print dataTable
            except:
                print str(counter) + ': ' + date + ' did not work'
            counter += 1

    ofile  = open('/Users/jimshields/Documents/Blog/Data/imdb_top_250/archive/took_250_' + str(year) + '.csv', "wb")
    writer = csv.writer(ofile)

    for row in dataTable:
        writer.writerow(row)

    ofile.close()