---
title: "leetcode one-liners: remove element"
description: "Solving LeetCode's \"Remove Element\" problem by making clever use of reduceRight and splice array methods"
pubDate: 2023-10-28T09:27:09.772Z
draft: true
categories:
  - leetcode one-liners
tags:
  - leetcode
  - javascript
---

This post serves as a foundation, for what I'd like to become a weekly series, where I try to come up with solution to a given LeetCode problem using only an inline return JavaScript arrow function. This means that I'm limited to using expressions as my functions' bodies, so curly braces with statements minified into a single line are prohibited.

With that out of the way, here's how I've managed to solve [the "Remove Element" puzzle](https://leetcode.com/problems/remove-element/description/).

## the goal

This problem requires us to create a `removeElement` function that accepts two arguments:

1. `nums` - an array of integers in range from 0 to 50 inclusive
2. `val` - an integer in range from 0 to 100 inclusive

The function should remove all occurences of `val` from the original `nums` array and return an integer `k`, which is equivalent to the `nums` array's new length.

## the algorithm

We should initialise our variable `k` to 0 and loop through each item in `nums`, starting from the end of the array. If the current item equals `val`, we should remove it from `nums` array. Otherwise, we should increment `k` by 1. Once we've gone throgh every single item, we can return `k`.

Note that by starting our loop from the last item, we ensure no item gets skipped after the previous number's been removed.

## the code

After many different iterations, the one-liner that turned out to be the most runtime and memory efficient, clocked at 42 milliseconds (beating 95.15% of accepted submissions) and used 41.24 megabytes (beating 96.98% of accepted submissions) respectively. That's not too bad if you ask me.

But anyway, here's what the code looks like:

```js
const removeElement = (nums, val) => nums.reduceRight((k, n, i) => k += 1 - nums.splice(i, +(n === val)).length, 0)
```

If you take advantage of declaring implicit global variables, remove spaces, and take liberties with renaming the main function and its arguments, you can end up with this syntactically-valid beauty:

```js
f=(a,v)=>a.reduceRight((k,n,i)=>k+=1-a.splice(i,+(n===v)).length,0)
```

## the explanation

Let's go back to the former snippet and break it down bit-by-bit.

### reduceRight array method

My `removeElement` function will return the result of `reduceRight` method called on the `nums` array:

```js
const removeElement = (nums, val) => nums.reduceRight(/*...*/)
```

But what does it do and what exactly does it return? This method allows us to iterate through all the items in the array, starting from the last one (or in other words, **the right side** of the array), and **reduce them down** to a single value - hence the name `reduceRight`.

`reduceRight` accepts 2 arguments:

1. Callback function that will be executed for each item in the array. It can take up to 4 parameters:
   1. Accumulator, AKA the value we reduce the array down to. From the second iteration onwards, the accumulator's value is set to whatever was returned when the function got called in the previous iteration. Once `reduceRight`'s gone through all the items,
   2. Item we're currently looping through
   3. Current item's index (optional, but it will come in handy later)
   4. The array itself (optional; this argument is not used in our case)
2. The accumulator's initial value. If ommited, the accumulator will be initialised to the first item's value and the loop will begin from the second to last item in the array

Now that we're on the same page regarding `reduceRight`, we can move on to its first argument

### reduceRight's callback function

Here's the callback function on its own:

```js
(k, n, i) => k += 1 - nums.splice(i, +(n === val)).length
```

This is another inline returhn arrow function, where we utilise the `+=` operator to increment our accumulator `k` by `1 - nums.splice(i, +(n === val)).length` and return `k`'s' value after incrementation. In order to understand what it will be incremented by, we must take a closer look at this weird bit after `1 -`.

### splice array method

Splice is a really versatile method, because it allows you to add, replace, and most importantly for us, remove elements from an array. In order to do so, we need to provide it with 2 arguments:

1. Index to start removing items from
2. Number of items to remove

So we pass `i` (the current item's index) as the first argument, but then follow it up with `+(n === val)`... what's up with that?

`n === val` checks if the number we're iterating through equals the value whose all occurences in the `nums` array are supposed to be deleted. By wrapping this expresion in parentheses and prepending a `+`, we can convert the boolean returned by our equality comparison to a number: `1` for `true`, and `0` for `false`.

This means that if `n === val` returns `true`, then the item we're looping through will be removed because the remove count will be set to `1`. Likewise, if `n === val` returns `false`, the delete count will be set to `0`, and thus the item won't get removed.

Finally we take advantage of the `splice` method's return value, which is an array of items that have been removed. Therefore, we can obtain the delete count by reading this array's `length`. So if you come back to the `1 - nums.splice(i, +(n === val)).length` bit, we can now tell what `k` will get incremented by, and thus what our callback function will return.

If the `length` of the array returned by `splice` equals `0` (ie. the current item hasn't got deleted), we increment `k` by `1 - 0`, so `1`. If the length of that array equals `1` (ie. the current item has been removed), we increment `k` by `1 - 1`, so `0`.

### reduceRight's second argument

And last but not least, we've got the second argument that we need to pass to the `reduceRight` method:

```js
nums.reduceRight(/*...*/, 0)
```

By passing `0` as the initial value for our `k`, we ensure no error gets thrown in case `nums` turns out to be an empty array. This return value makes sense, because its length is `0`, and if all items from a non-empty array get removed, its new length will also be `0`.

## the end

Thank you so much if you've made it this far!

While I agree that these examples put form over, hah, function, and that if you get too smart with one-liners the code can become unreadable, I also consider these self-imposed one-liner challenges a fun way to explore and exploit some of the features and quirks JavaScript has to offer.

Take care and stay tuned for the next post in this series!
