brands=("drb" "gol" "jrw" "nor" "now" "nrt" "pen" "skh" "sol" "sre")
# IDs: 23084 15 86837 3302 129 4200 466 472 698 10421 878 131935 145681 115174 10625 10740 9235 10035 71106 109322 72733
# Note: Sports Research Vitamin K2 might be 72733.

check_url() {
  local b=$1
  local id=$2
  local padded_id=$(printf "%05d" $id)
  local urls=(
    "https://s3.images-iherb.com/$b/${b}${id}/l/0.jpg"
    "https://s3.images-iherb.com/$b/${b}${padded_id}/l/0.jpg"
    "https://s3.images-iherb.com/$b/${b}${id}/v/0.jpg"
    "https://s3.images-iherb.com/$b/${b}${padded_id}/v/0.jpg"
  )
  for url in "${urls[@]}"; do
    if curl -sI "$url" | grep -q "HTTP/2 200"; then
      echo "MATCH|$b|$id|$url"
      return 0
    fi
  done
  return 1
}

# Testing a few
check_url "drb" 23084
check_url "drb" 15
check_url "gol" 86837
check_url "jrw" 3302
check_url "jrw" 129
check_url "nor" 4200
check_url "now" 466
check_url "now" 472
check_url "now" 698
check_url "now" 10421
check_url "now" 878
check_url "nrt" 131935
check_url "pen" 145681
check_url "skh" 115174
check_url "sol" 10625
check_url "sol" 10740
check_url "sol" 9235
check_url "sol" 10035
check_url "sre" 71106
check_url "sre" 109322
check_url "sre" 72733
