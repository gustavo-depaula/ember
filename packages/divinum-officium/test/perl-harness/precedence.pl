#!/usr/bin/perl
# Golden harness for the kalendar port: runs horascommon.pl's precedence()
# for one JSON request per stdin line {version, date ('mm-dd-yyyy'), hora?,
# missa?} and prints the resolved day as JSON.
#
# NOTE: must be executed from inside the DO checkout at
# web/cgi-bin/horas/ (the test copies it there) so FindBin-relative data
# paths in Directorium.pm and SetupString.pl resolve.
use strict;
use warnings;
use utf8;
use FindBin qw($Bin);
use lib "$Bin/..";
use JSON::PP;
binmode(STDIN, ':encoding(UTF-8)');
binmode(STDOUT, ':encoding(UTF-8)');

our ($version, $datafolder, $missa, $hora, $lang1, $lang2, $testmode, $caller, $votive, $dioecesis);
our ($error, $debug, $missanumber);

$datafolder = "$Bin/../../www/horas";
$main::langfb = 'English';

# Stubs for the CGI-side helpers precedence pulls in.
sub strictparam { '' }

sub getdialog {
  my $name = shift;
  our %_dialog_cache;
  unless (%_dialog_cache) {
    %_dialog_cache = %{ main::setupstring('', 'horas.dialog', 'resolve@' => 0) || {} };
  }
  return $_dialog_cache{$name};
}

require "$Bin/../DivinumOfficium/SetupString.pl";
require "$Bin/horascommon.pl";

# initiarule lives in specmatins.pl which drags in rendering deps; the TS port
# stubs it too, and we never compare the fields it decorates.
sub initiarule { '' }

my $json = JSON::PP->new->utf8(0)->canonical;

while (my $line = <STDIN>) {
  chomp $line;
  next unless $line;
  my $req = $json->decode($line);

  $version = $req->{version};
  $hora = $req->{hora} // 'Laudes';
  $missa = $req->{missa} ? 1 : 0;
  $lang1 = 'Latin';
  $lang2 = 'Latin';
  $testmode = 'regular';
  $caller = 0;
  $votive = '';
  $dioecesis = '';
  $error = '';
  $missanumber = 0;
  $main::monthday = '';
  %main::setupstring_caches_by_version = ();

  our ($winner, $rank, $commemoratio, $commemoratio1, $comrank, $commune, $communetype, $scriptura);
  our (@dayname, $duplex, $laudes, @commemoentries, $transfervigil, $initia, $monthday);

  main::precedence($req->{date});

  print $json->encode({
    winner => "$winner",
    rank => "$rank",
    commemoratio => "$commemoratio",
    comrank => "$comrank",
    commune => "$commune",
    communetype => "$communetype",
    scriptura => "$scriptura",
    dayname0 => "$dayname[0]",
    dayname1 => "$dayname[1]",
    duplex => "$duplex",
    laudes => "$laudes",
    commemoentries => [map {"$_"} @commemoentries],
    transfervigil => "$transfervigil",
    monthday => ($monthday // ''),
    error => "$error",
  }) . "\n";
}
