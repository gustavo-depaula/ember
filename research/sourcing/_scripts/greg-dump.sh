S=/Users/gustavo/Documents/prayer/research/sourcing/_scripts/wsdump.py
cd /Users/gustavo/Documents/prayer/research/sourcing/gregory-the-great
for p in "Moralia/" "Homiliarum in Evangelia" "Homiliarum in Ezechielem Prophetam" "Dialogi (Gregorius Magnus)" "Epistolae (Gregorius Magnus)" "Regulae Pastoralis" "Commentarii in librum I Regum" "Expositio in Canticum Canticorum (Gregorius" "Hymni (Gregorius" "Moralia II" "Moralia I"; do
  d=ws/$(echo "$p" | tr -c 'A-Za-z0-9\n' '_')
  python3 $S la "$p" "$d" | tail -1
done
