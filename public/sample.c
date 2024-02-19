int a, b = 1, c = 2;

int fact_iter(int i, int n, int acc);

int fact(int n) {
  return fact_iter(1, n, 1);
}

int fact_iter(int i, int n, int acc) {
  return i > n ? acc : fact_iter(i + 1, n, acc * i);
}

int main() {
  fact(2 * 3);
  return 0;
}