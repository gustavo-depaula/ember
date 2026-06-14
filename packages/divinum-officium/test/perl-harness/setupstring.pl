#!/usr/bin/perl
# Differential-test harness for setupstring(): reads one JSON request per
# stdin line: {version, lang, fname, area ('horas'|'missa'), resolve
# ('none'|'wholefile'|'all'), dayname0?, dayofweek?, hora?, day?, month?,
# year?} and prints the resulting {section: text} hash as JSON.
use strict;
use warnings;
use utf8;
use FindBin qw($Bin);
use lib "$Bin/../../../../.divinum-officium/web/cgi-bin";
use JSON::PP;
binmode(STDIN, ':encoding(UTF-8)');
binmode(STDOUT, ':encoding(UTF-8)');

our ($version, $datafolder, $missa, $hora, $dayofweek, $day, $month, $year, $monthday);
our (@dayname, $winner, $commemoratio, $commune, $votive, $dioecesis, %winner, $error);
our $langfb;

my $wwwroot = "$Bin/../../../../.divinum-officium/web/www";

require "$Bin/../../../../.divinum-officium/web/cgi-bin/DivinumOfficium/SetupString.pl";

my $json = JSON::PP->new->utf8(0)->canonical;

my %resolve_map = (none => 0, wholefile => 1, all => 2);

while (my $line = <STDIN>) {
  chomp $line;
  next unless $line;
  my $req = $json->decode($line);

  $version = $req->{version} // 'Rubrics 1960 - 1960';
  @dayname = ($req->{dayname0} // '', $req->{dayname1} // '', '');
  $dayofweek = $req->{dayofweek} // 0;
  $hora = $req->{hora} // 'Laudes';
  ($day, $month, $year) = ($req->{day} // 1, $req->{month} // 1, $req->{year} // 2026);
  $missa = ($req->{area} // 'horas') eq 'missa' ? 1 : 0;
  $monthday = '';
  ($winner, $commemoratio, $commune, $votive, $dioecesis) = ('', '', '', '', '');
  %winner = ();
  $error = '';
  $langfb = 'English';
  $main::langfb = 'English';
  $datafolder = "$wwwroot/" . ($req->{area} // 'horas');

  # setupstring caches per version; context (dayname/hora) varies between our
  # requests, so flush the cache every request for correctness.
  %main::setupstring_caches_by_version = ();

  my $s = main::setupstring($req->{lang}, "$req->{fname}.txt", 'resolve@' => $resolve_map{$req->{resolve} // 'all'});
  print $json->encode($s ? {%$s} : {}) . "\n";
}
