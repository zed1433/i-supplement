ids=("drb-23084" "drb-00015" "gol-86837" "jrw-03302" "jrw-00129" "nor-04200" "now-00466" "now-00472" "now-00698" "now-10421" "now-00878" "nrt-131935" "pen-145681" "skh-115174" "sol-10625" "sol-10740" "sol-09235" "sol-10035" "sre-71106" "sre-109322" "sre-72733")

for id in "${ids[@]}"; do
  url="https://images.iherb.com/l/$id-0.jpg"
  status=$(curl -sI "$url" | head -n 1)
  echo "$id|$url|$status"
done
