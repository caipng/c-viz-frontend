struct s {
  char c;
  int x;
  char d;
} dd;

int A;
char C;

void f(int a, int b, char c) {
  int d = a + b;
  d++;
  int * p = malloc(15);
  int * p1 = (int *) malloc(15);
  {
    int ii;
    int kk;
    p1++;
  }
  {
    int jj;
    int kk;
    {
      short s1;
    }
    {
      short s2;
    }
  }
}

int main() {
  f(1, 2, 3);
}