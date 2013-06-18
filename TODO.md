# CalVAD Outliers

This module uses calvad_compute_aadt to compute the average annual
daily traffic for a particular detector.  The aadt code requires
task.data, so I have to load that up from CouchDB.  Then I don't want
the direct output of compute aadt, but rather I want to know which
hours exceed that.

So.  Program flow:


1. get one detector hourly data from couchdb.
2. pass task to compute aadt
3. suss out the outliers
4. update the records in couchdb with outlier flag

5. update other code so that the outlier flag is respected somehow


0. Get all of the detector ids with data
1. for each
2.  get the data
3.  do the above

Create a couchCache getter, and a reducer, and then get features.

I don't really need a reducer.  Can probably no op it.
