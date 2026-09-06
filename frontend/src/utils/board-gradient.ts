const BOARD_GRADIENTS = [
  "linear-gradient(135deg, #0079bf 0%, #5067c5 100%)",
  "linear-gradient(135deg, #519839 0%, #4bbf6b 100%)",
  "linear-gradient(135deg, #b04632 0%, #d29034 100%)",
  "linear-gradient(135deg, #89609e 0%, #cd5a91 100%)",
  "linear-gradient(135deg, #cd5a91 0%, #ff78cb 100%)",
  "linear-gradient(135deg, #4bbf6b 0%, #00aecc 100%)",
  "linear-gradient(135deg, #00aecc 0%, #838c91 100%)",
  "linear-gradient(135deg, #172b4d 0%, #505f79 100%)",
];

export function getBoardGradient(id: string): string {
  let hash = 0;

  for (let index = 0; index < id.length; index += 1) {
    hash = id.charCodeAt(index) + ((hash << 5) - hash);
  }

  return BOARD_GRADIENTS[Math.abs(hash) % BOARD_GRADIENTS.length];
}
