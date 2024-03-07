+++
title = "Data classes in Python"
date = "2024-02-20"
description = """Using **Data Classes** in **Python** is a super convenient way
to represent data & properties assigned to a class. It saves you from having to
implement your own **special methods** like `__init__` & makes managing the
class a breeze when requirements change for how the underlying data is
represented."""
slug = "data-classes-in-python"
tags = ["devex", "programming"]
draft = true
+++

Let's talk classes in *Python*. They're a great way to organized functions &
behaviors that center around a particular instance of data & functionality. A
simple class is with an `__init__` method to initialize some properties on the
instance. There are other **special methods** in *Python* like the `__repr__`
method to get a string representation of the class among others. Below I'll
break down what kinds of *special methods* you'll need to add to your class to
get the most out of using them & how to simplify writing classes when they're
centered around data specifically using *Data Classes*.

> `tl;dr`
>
> **Python** 3.7 introduced [**Data Classes**][docs-dataclasses] as described in
> [**PEP 557**][docs-pep557]. A **Data Class** is a way to write less
> boilerplate around classes by using the `@dataclass` decorator to add
> **special methods** based on the variables defined in the class that use type
> annotations.
>
> If you'd like to read more about them yourself, you read the documentation
> linked above.
>
> The inspiration for this post was reading through the [**Pydantic**
> documentation on `dataclass`][docs-pydantic] which lead me back to these very
> useful class decorators for data-driven classes in **Python**.

[docs-pep557]: https://peps.python.org/pep-0557
[docs-dataclasses]: https://docs.python.org/3/library/dataclasses.html
[docs-pydantic]: https://docs.pydantic.dev/dev/api/dataclasses/#pydantic.dataclasses.dataclass

## Writing a data-driven class the long way

Okay, so bare with me here. The next few sections are going to show you how to
write a good-practice data-driven class without using the *Data Classes* library
in *Python* >= 3.7. If you'd like to skip all this and get section using the
`@dataclass` decorator, [you can click here to that section][skip].

[skip]: {{< relref "writing/data-classes-in-python#writing-our-simpleflag-class-with-dataclasses" >}}

```python { title = "simple-flag.py" hl_lines = [ 3, 7 ] }
class SimpleFlag:
  """Class for setting up flag objects with a name & a status."""
  def __init__(self, name: str, is_active: bool):
    self.name: str = name
    self.is_active: bool = is_active

  def __repr__(self) -> str:
      a = self.is_active
      n = self.name
      return f'Simple Flag name: {n} & status: {a}'

  def toggle(self):
    self.is_active = not self.is_active
```

This works OK, but we aren't done!. There's a whole set of *special methods*
missing here that need to be implemented. Things like initializing & printing
values are the bare minimum here.

### Setting up equality checking

First, let's start with checking for equality. This is useful if we're passing
around flags & want to compare them to each other. Here's the code for adding
the `__eq__` & `__ne__` short for equal & not equal respectively.

```py { title = "Implementing equality too" verbatim = false hl_lines = [3,9] }
# ... further down `simple-flag.py`

  def __eq__(self, compa):
    if compa.__class__ is self.__class__:
      return (self.name, self.is_active) == (compa.name, compa.is_active)
    else:
      return NotImplemented

  def __ne__(self, compa):
    result = self.__eq__(compa)
    if result is NotImplemented:
      return NotImplemented
    else
      return not result
```

Now that we can compare instances of the `SimpleFlag`, we can think about
**hashability & making this class hashable**. In order to do that we'll need to
create a `__hash__` deterministic method that returns a value based on the
unique properties of the class.

<details>

<summary>💡 What's <strong>"hashable"</strong> mean for a class in <em>Python</em>?</summary>

### Understanding why **hashability** is important

To understand what a hashable object is in *Python*, let's define what
hashability means & why it's needed. You need to make your class hashable when
you will use instances as items in a dictionary or set. [*Python* includes a
`hash()` function][docs-hash-func] that you can use with arguments consisting of
properties of the class.

[docs-hash-func]: https://docs.python.org/3/library/functions.html#hash

[The `__hash__` special method][docs-hash-method] **needs to return an integer
with the same value every time** so it only works best when the arguments being
passed-in are immutable. To be able to use the `__hash__` method, you'll need to
implement a `__eq__` as well.

[docs-hash-method]: https://docs.python.org/3/reference/datamodel.html#object.__hash__

#### Practical uses for hashable classes

Having a hashable class is important so you can create class instances that can
be used as keys in dictionaries. This allows for efficient lookup & retrieval.
When using class instances in a set, you can then filter & de-duplicate data.
Lastly, hashable classes are needed for creating custom data structures such as
bloom filters & hash tables.

</details>

```py { title = "Implementing hashing also" verbatim = false hl_lines = [3] }
# ... even further down `simple-flag.py`

  def __hash__(self):
    return hash((self.__class__, self.name, self.is_active))
```

Now if we make the instance hashable, we have to initialize our class properties `name`
& `is_active` arguments immutable.

### Making properties immutable manually

Okay, so the next step is to re-write the `__init__` method & add the
`@property` decorator to new methods for the properties to be able to access
them.

```py { title = "Making properties immutable" verbatim = false hl_lines = [4,5,7,8,11,12] }
# ... making the new changes to `__init__` & adding property access methods

  def __init__(self, name: str, is_active: bool):
    self.__name: str = name
    self.__is_active: bool = is_active

  @property
  def name(self) -> str:
    return self.__name

  @property
  def is_active(self) -> bool:
    return self.__is_active
```

As you can see in the highlighted sections above, that's a lot to be adding to
this simple class, but so far we have immutability in our class, hashing in case
you want to store instances in a dictionary, along with checking for equality or
not, being able to print the values of the class in a string representation, &
initialization of the class.

Another thing to keep in mind here is that because we've used double-underscores
or dunders (`__`) as the prefix to our properties in the class, we now have to
modify our access of these properties in the class with the same prefix. For the
next change, I'll use the new `__` prefix when accessing the properties, but
keep in mind that you have to update how you access properties internally in the
class when you make properties immutable.

### Setting up comparison methods

We're still missing one major feature, & that's sorting. So we have to implement
those *special methods* as well below.


```py { title = "Implementing sorting as well" verbatim = false hl_lines = [3,9,15,21] }
# ... further still down `simple-flag.py`

  def __lt__(self, compa):
    if compa.__class__ is self.__class__:
      return (self.__name, self.__is_active) < (compa.__name, compa.__is_active)
    else:
      return NotImplemented

  def __le__(self, compa):
    if compa.__class__ is self.__class__:
      return (self.__name, self.__is_active) <= (compa.__name, compa.__is_active)
    else:
      return NotImplemented

  def __gt__(self, compa):
    if compa.__class__ is self.__class__:
      return (self.__name, self.__is_active) > (compa.__name, compa.__is_active)
    else:
      return NotImplemented

  def __ge__(self, compa):
    if compa.__class__ is self.__class__:
      return (self.__name, self.__is_active) >= (compa.__name, compa.__is_active)
    else:
      return NotImplemented

```

With those last changes, we now have a fully implemented class with the *special
methods* needed for **initializing**, **printing**, **sorting**, **comparing**,
& **hashability**. We're done with this class as long as none of the properties
need to be changed.

<details>
<summary>Check out the whole file for
  <code>simple-flag.py</code>.</summary>

Below I've highlighted all the *special methods* that have been added to
`simple-flag.py` in a single file. You can see that there are 11 methods that
were added to the class.

```py { title = "simple-flag.py" hl_lines = [3,"7-8", "11-12",15,23,29,36,39,45,51, 57] }
class SimpleFlag:
  """Class for setting up flag objects with a name & a status."""
  def __init__(self, name: str, is_active: bool):
    self.__name: str = name
    self.__is_active: bool = is_active

  @property
  def name(self) -> str:
    return self.__name

  @property
  def is_active(self) -> bool:
    return self.__is_active

  def __repr__(self) -> str:
      a = self.__is_active
      n = self.__name
      return f'Simple Flag name: {n} & status: {a}'

  def toggle(self):
    self.__is_active = not self.__is_active

  def __eq__(self, compa):
    if compa.__class__ is self.__class__:
      return (self.__name, self.__is_active) == (compa.__name, compa.__is_active)
    else:
      return NotImplemented

  def __ne__(self, compa):
    result = self.__eq__(compa)
    if result is NotImplemented:
      return NotImplemented
    else
      return not result

  def __hash__(self):
    return hash((self.__class__, self.__name, self.__is_active))

  def __lt__(self, compa):
    if compa.__class__ is self.__class__:
      return (self.__name, self.__is_active) < (compa.__name, compa.__is_active)
    else:
      return NotImplemented

  def __le__(self, compa):
    if compa.__class__ is self.__class__:
      return (self.__name, self.__is_active) <= (compa.__name, compa.__is_active)
    else:
      return NotImplemented

  def __gt__(self, compa):
    if compa.__class__ is self.__class__:
      return (self.__name, self.__is_active) > (compa.__name, compa.__is_active)
    else:
      return NotImplemented

  def __ge__(self, compa):
    if compa.__class__ is self.__class__:
      return (self.__name, self.__is_active) >= (compa.__name, compa.__is_active)
    else:
      return NotImplemented

```
</details>

### Adding more properties to the class

Now let's add a new feature to our `simple-flag.py` because tracking `name` &
`is_active` is not enough. We also want to track a new property named
`created_at`. In order to do this, you'll need to **modify nine methods** &
**add a new `@property` decorator to a new method** to return the immutable
`created_at` value. This would mean **modifying all the code that sets
properties & gets properties** from the class. It also means **all of the
comparison & hash methods will need to be modified**.

Taking the original `simple-flag.py` file & modifying it with all the changes I
mentioned produces a fairly large diff using `git diff --no-index --stat` for
just adding a single property.


```sh { title = "Adding created_at to the class" verbatim = false }
 simple-flag.py => simple-flag.py | 24 ++++++++++++++++--------
 1 file changed, 16 insertions(+), 8 deletions(-)
```

<details>
<summary>If you're curious about seeing all the changes you can click here.</summary>

As you can see below, there are a lot of modifications that need to be made just
because there was a single property added to the class. As more properties get
added to a class, you'll need to modify more & more sections of your class in
the similar ways.

```diff { title = "Modifying the class to add created_at" verbatim = false }
diff --git a/simple-flag.py b/simple-flag.py
index 500590a..7507354 100644
--- a/simple-flag.py
+++ b/simple-flag.py
@@ -1,8 +1,11 @@
+from datetime import datetime
+
 class SimpleFlag:
   """Class for setting up flag objects with a name & a status."""
-  def __init__(self, name: str, is_active: bool):
+  def __init__(self, name: str, is_active: bool, created_at: datetime):
     self.__name: str = name
     self.__is_active: bool = is_active
+    self.__created_at: datetime = created_at

   @property
   def name(self) -> str:
@@ -12,17 +15,22 @@ class SimpleFlag:
   def is_active(self) -> bool:
     return self.__is_active

+  @property
+  def created_at(self) -> datetime:
+    return self.__created_at
+
   def __repr__(self) -> str:
+      c = self.__created_at
       a = self.__is_active
       n = self.__name
-      return f'Simple Flag name: {n} & status: {a}'
+      return f'Simple Flag created at: {c}, name: {n}, & status: {a}'

   def toggle(self):
     self.is_active = not self.is_active

   def __eq__(self, compa):
     if compa.__class__ is self.__class__:
-      return (self.__name, self.__is_active) == (compa.__name, compa.__is_active)
+      return (self.__name, self.__is_active, self.__created_at) == (compa.__name, compa.__is_active, compa.__created_at)
     else:
       return NotImplemented

@@ -34,28 +42,28 @@ class SimpleFlag:
       return not result

   def __hash__(self):
-    return hash((self.__class__, self.__name, self.__is_active))
+    return hash((self.__class__, self.__name, self.__is_active, self.__created_at))

   def __lt__(self, compa):
     if compa.__class__ is self.__class__:
-      return (self.__name, self.__is_active) < (compa.__name, compa.__is_active)
+      return (self.__name, self.__is_active, self.__created_at) < (compa.__name, compa.__is_active, compa.__created_at)
     else:
       return NotImplemented

   def __le__(self, compa):
     if compa.__class__ is self.__class__:
-      return (self.__name, self.__is_active) <= (compa.__name, compa.__is_active)
+      return (self.__name, self.__is_active, self.__created_at) <= (compa.__name, compa.__is_active, compa.__created_at)
     else:
       return NotImplemented

   def __gt__(self, compa):
     if compa.__class__ is self.__class__:
-      return (self.__name, self.__is_active) > (compa.__name, compa.__is_active)
+      return (self.__name, self.__is_active, self.__created_at) > (compa.__name, compa.__is_active, compa.__created_at)
     else:
       return NotImplemented

   def __ge__(self, compa):
     if compa.__class__ is self.__class__:
-      return (self.__name, self.__is_active) >= (compa.__name, compa.__is_active)
+      return (self.__name, self.__is_active, self.__created_at) >= (compa.__name, compa.__is_active, compa.__created_at)
     else:
       return NotImplemented

```

</details>

Now **that's a lot** of changes to add or remove properties. It's easy to make a
mistake as well as you're finding & replacing text. Thankfully, there is a
better way to write classes in *Python* where these 11 methods & more are added
automatically. These classes are called *Data Classes*. They are a great way to
succinctly define classes that store data.

## Writing our `SimpleFlag` class with `dataclasses`

To write the same `simple-flag.py` class using the *Data Classes* decorator, you
will first notice that there is a lot less method definitions involved.

```py { title = "simple-flag.py" hl_lines = [4] }
from dataclasses import dataclass
from datetime import datetime

@dataclass()
class SimpleFlag:
  name: str
  is_active: bool
  created_at: datetime
```

Your eyes aren't playing tricks on you. That's it. As [PEP 557][docs-pep557]
said, this is a convenient way to create classes. The `@dataclass` decorator
takes the type annotations from the class variables definitions & adds the
following *special methods* to our `SimpleFlag` instance.

- `__init__` - How the class gets initialized is taken care for us.
- `__repr__` - How the class is represented is taken care for us.
- `__eq__` - How the class is compared between instances is taken care for us.


#### Assigning default values

You can also assign default values to properties is straight-forward. Taking the
example above, let's add a default value of `False` to the `is_active` property
if it's not passed in.

```py { title = "" hl_lines = [ 7 ] }
from dataclasses import dataclass
from datetime import datetime

@dataclass()
class SimpleFlag:
  name: str
  is_active: bool = True
  created_at: datetime
```

### Adding immutability to *Data Classes*

```py { title = "immutable-simple-flag.py" hl_lines = [4] }
from dataclasses import dataclass
from datetime import datetime

@dataclass(frozen=True)
class SimpleFlag:
  name: str
  is_active: bool
  created_at: datetime
```

Now, if you'd like to add immutability, you can pass arguments into the
`@dataclass` decorator. This has the added feature of adding the following
*special methods* as well.

- `__hash__`
- `__setattr__`

#### Modifying properties by creating new copies

With the `frozen=True` keyword argument in the decorator call for the *Data
Class*, you can't modify properties of an instance directly. But if you can
create a copy with a different value for an immutable property like so.

```py { title = "main.py" hl_lines = [13] }
from dataclasses import dataclass
from datetime import datetime

@dataclass(frozen=True)
class SimpleFlag:
  name: str
  is_active: bool
  created_at: datetime


def main():
  prod_flag = SimpleFlag("prod", false, datetime.now())
  modified_prod_flag = dataclasses.replace(prod_flag, is_active=True)
```

With the `dataclasses.replace()` function, you pass in the class you'd like to
modify as the first argument with keyword arguments for the properties you'd
like to modify.

### Adding ordering to *Data Classes*

```py { title = "ordered-simple-flag.py" hl_lines = [4] }
from dataclasses import dataclass
from datetime import datetime

@dataclass(order=True)
class SimpleFlag:
  name: str
  is_active: bool
  created_at: datetime
```

- `__ge__`
- `__gt__`
- `__le__`
- `__lt__`

#### Adding a `sort_index` to control ordering

Since we're no longer writing our own sorting methods, we will have to implement
a control for how our instances are ordered. We can do this with the
control the how

### Setting default values

With *Data Classes* you can also set defaults for properties of the class. This
is done with the syntax.

#### Creating properties that are unique to an instance

When working with *Data Classes*, you will have to use the `fields` function
from the `dataclasses` library to make certain mutable properties unique to the
instance.

> Take the following code where one of the properties is a list.

In this example above, the list will be shared across all instances of the
class. If you want to make things unique, you will need to import the `fields`
function from `dataclasses`.

> See how easy it is to make a unique list per instance of the class.

## Whew, & that's a wrap folks

I've covered a lot in this post. *Python* classes can be written in two distinct
ways such as a behavior-driven class and a data-driven class. If you're writing
the latter of these types, you will want to write much less boilerplate & use
the new `@dataclass` decorator to make the maintenance of these classes easy
going forward. It might even inspire you to write your behavior-driven classes
as a *Data Class* to save time & complexity for your class writing. Thanks for
making it this far in this post. I hope you enjoyed reading it as much as I did
writing it.
