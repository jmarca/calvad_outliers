
# calvad_outliers

  Compute outliers from the imputation work for each CalVAD detector

# Overview

As part of the QA/QC for CalVAD, this package will iterate over each
detector in the CalVAD CouchDB imputation database and will attempt to
weed out outliers.

In a nutshell, the imputation process sometimes produces a single
period in a day which is extremely high.  This might be due to a bad
observation, or a strange combination of input factors, but the
outcome is that an entire period of data can be way off because one
hourly imputation for one detector is too high.

The code in this module attempts to identify such outliers by running
over all of the observations for a site and computing the average
annual daily traffic figure.  (Now that I think about it, perhaps I
should be computing the median annual daily traffic value, which would
be resistant to outliers, since I am explicitly trying to remove
outliers.)  Once this value is determined for a detector, then each
*hourly* value is compared to the expected *daily* traffic volume.  If
one hour's volume is greater than the expected daily volume, then the
hour is flagged as an outlier, and the CalVAD database is updated
accordingly.

# Caveats and issues with the current implementat

## Average versus median

The reason I say that the median values should be used is that median
computations are resistant to outliers.  A similar feature could be
obtained by taking the 85^{th} percentile day.  By using the straight
average, an extremely high single value could mask many other high,
outlier values, thus requiring multiple runs of this code.

## Replacing removed values

Another issue is how to replace the removed values.  Ideally I would
re-run the imputation process, and replace these values.  That is the
best solution, but this project needs to be done, not perfect.
Therefore a better option is to compute the median hourly observation
given similar hours, days of week

## Use R

The more I consider the deficiencies of this code, the more I am
tempted to just call out to R and do it properly.  R code could
compute the median daily value, the median hourly value for each
hour/day of week combination probably a bit faster than my JavaScript
code can, plus it would use a different core that would speed up the
overall processing time.




## License

(GPL v2)

Copyright (c) 2013 James E. Marca &lt;jmarca@translab.its.uci.edu&gt;

See the file COPYING for details
