#!/usr/bin/perl
# Differential-test harness: feeds line vectors through Divinum Officium's
# real process_conditional_lines (SetupString.pl) so the TS port can be
# compared against ground truth. Reads one JSON object per stdin line:
#   {version, dayname0?, dayname1?, dayofweek?, hora?, day?, month?, year?, lines[]}
# Writes one JSON array of output lines per input line.
use strict;
use warnings;
use utf8;
use FindBin qw($Bin);
use lib "$Bin/../../../../.divinum-officium/web/cgi-bin";
use JSON::PP;
binmode(STDIN, ':encoding(UTF-8)');
binmode(STDOUT, ':encoding(UTF-8)');

# Globals consumed by SetupString.pl / vero().
our ($version, $datafolder, $missa, $hora, $dayofweek, $day, $month, $year, $monthday);
our (@dayname, $winner, $commemoratio, $commune, $votive, $dioecesis, %winner);

require "$Bin/../../../../.divinum-officium/web/cgi-bin/DivinumOfficium/SetupString.pl";

my $json = JSON::PP->new->utf8(0)->canonical;

while (my $line = <STDIN>) {
  chomp $line;
  next unless $line;
  my $req = $json->decode($line);

  $version = $req->{version} // 'Rubrics 1960 - 1960';
  @dayname = ($req->{dayname0} // '', $req->{dayname1} // '', '');
  $dayofweek = $req->{dayofweek} // 0;
  $hora = $req->{hora} // 'Laudes';
  ($day, $month, $year) = ($req->{day} // 1, $req->{month} // 1, $req->{year} // 2026);
  $missa = 0;
  $monthday = '';
  ($winner, $commemoratio, $commune, $votive, $dioecesis) = ('', '', '', '', '');
  %winner = ();

  my @out = main::process_conditional_lines(@{$req->{lines}});
  print $json->encode(\@out) . "\n";
}
