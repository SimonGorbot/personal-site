---
title: "Code Tabs Shortcode Test"
date: 2026-07-22
draft: false
excludeFromSearch: true
robots: "noindex, nofollow"
sitemap:
  disable: true
showDate: false
showReadingTime: false
showWordCount: false
---

This scratch page exercises the local `codetabs` and `codetab` shortcodes.

## Different Languages

{{< codetabs default="Rust" >}}
{{< codetab title="Rust" lang="rust" >}}
fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}

fn main() {
    println!("{}", greet("Simon"));
}
{{< /codetab >}}

{{< codetab title="Python" lang="python" >}}
def greet(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("Simon"))
{{< /codetab >}}

{{< codetab title="JavaScript" lang="javascript" >}}
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("Simon"));
{{< /codetab >}}
{{< /codetabs >}}

## Same Language, Different Implementations

{{< codetabs default="Iterator" >}}
{{< codetab title="Iterator" lang="rust" >}}
fn total(values: &[i32]) -> i32 {
    values.iter().sum()
}
{{< /codetab >}}

{{< codetab title="Loop" lang="rust" >}}
fn total(values: &[i32]) -> i32 {
    let mut sum = 0;

    for value in values {
        sum += value;
    }

    sum
}
{{< /codetab >}}
{{< /codetabs >}}

## Grouped Tabs

These two blocks share `group="language-demo"`, so selecting a language in one block selects the matching language in the other block.

{{< codetabs group="language-demo" default="Python" >}}
{{< codetab title="Python" lang="python" >}}
def add(a: int, b: int) -> int:
    return a + b
{{< /codetab >}}

{{< codetab title="Go" lang="go" >}}
func add(a int, b int) int {
    return a + b
}
{{< /codetab >}}
{{< /codetabs >}}

{{< codetabs group="language-demo" default="Python" >}}
{{< codetab title="Python" lang="python" >}}
values = [1, 2, 3]
print(sum(values))
{{< /codetab >}}

{{< codetab title="Go" lang="go" >}}
values := []int{1, 2, 3}
total := 0

for _, value := range values {
    total += value
}

fmt.Println(total)
{{< /codetab >}}
{{< /codetabs >}}
