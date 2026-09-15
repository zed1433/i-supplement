products=(
  "5eb55da0-bff0-4100-a6a2-0e73a8667f73|drb|23084"
  "6e28dd4e-fa53-4f04-b54b-3c6b775d31ef|drb|00015"
  "5851aac3-8965-4593-95cf-dd9f6c15ad09|gol|86837"
  "7325441f-3abd-49a8-a586-84946ab57dab|jrw|03302"
  "4ca72224-5cdc-4573-ad5a-125f9705dea8|jrw|00129"
  "6c33df83-127e-47c9-93f3-84e2e93ef933|nor|04200"
  "56b4001e-e5c2-4b0f-bf32-4ce6bd8051db|now|00466"
  "e5eeaf81-5a93-41cb-97b6-e335868012f8|now|00472"
  "e69eed3e-67c7-4a74-b020-b15b0ac37d85|now|00698"
  "fef3bf27-9a00-4a59-b4dc-4f1531a8014d|now|10421"
  "f8c224b4-5306-4dee-a64a-8dc52c8ec6f9|now|00878"
  "95892c78-627f-493d-82b3-d87f924133de|nrt|131935"
  "b8bbddf7-4e4a-400f-a80a-29590e505b1d|pen|145681"
  "50f03bde-a751-4905-978e-c18ba8c82f7b|skh|115174"
  "d3f281ae-efbe-4ea4-b6a8-9dc9172f7a09|sol|10625"
  "bd6bc9d2-b508-46e9-b0f5-3b03662794d8|sol|10740"
  "da082e88-f836-4a81-ab59-6ec9722c7a01|sol|09235"
  "c7f28a70-edb4-4969-b735-5629f3ba8641|sol|09656" # Guessing from Result 4 in search 5: p-69656
  "bcbe00bc-0432-455a-97b2-b7fc48b3f20e|sol|10035"
  "4477b409-7a9d-4b91-b0c4-718a4b6f4a39|sre|71106"
  "3f211474-d100-4bd3-b841-0c05ea90100f|sre|109322"
  "8376e012-80ac-494a-be41-72ca0b7abd60|sre|72733"
)

for p in "${products[@]}"; do
  IFS='|' read -r pid brand code <<< "$p"
  url="https://images.iherb.com/l/$brand-$code-0.jpg"
  secondary="https://images.iherb.com/l/$brand-$code-1.jpg"
  
  status=$(curl -sI "$url" | head -n 1)
  if [[ "$status" == *"200"* ]]; then
    sec_status=$(curl -sI "$secondary" | head -n 1)
    if [[ "$sec_status" == *"200"* ]]; then
      echo "$pid|$url|$secondary"
    else
      echo "$pid|$url|NONE"
    fi
  else
    # Fallback to other brands or slightly different codes if failed
    echo "FAILED|$pid|$url|$status"
  fi
done
