PRENOMFILE=https://www.data.gouv.fr/fr/datasets/r/9b219510-d1a2-43a5-8ddd-44161bc32fef

rm /tmp/dpt2015.txt 2> /dev/null
cd /tmp/
wget $PRENOMFILE
unzip /tmp/9b219510-d1a2-43a5-8ddd-44161bc32fef
cd -

cat /tmp/dpt2015.txt | iconv -f iso-8859-15 -t utf-8 | sed -r 's/[éëèê]+/E/ig' | sed -r 's/[üûù]+/U/ig' | sed -r 's/[îï]+/I/ig' | sed -r 's/[àâä]+/A/ig' | sed -r 's/[ôö]+/O/ig' | sed -r 's/[ç]+/C/ig' | awk -F '\t' '{ print $1 ";" $2}' | sort | uniq | awk -F ";" '{ sexe="F"; if($1 == "1") { sexe="M" } print sexe ";" toupper(substr($2,1,1)) tolower(substr($2,2))  }' > prenoms.csv

rm /tmp/9b219510-d1a2-43a5-8ddd-44161bc32fef
rm /tmp/dpt2015.txt
