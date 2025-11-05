# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - heading "Reset your password" [level=2] [ref=e7]
        - generic [ref=e8]: Enter your email address and we'll send you a reset link
      - generic [ref=e9]:
        - alert [ref=e10]:
          - generic [ref=e11]: Error
          - generic [ref=e12]: No account found with this email address. Please check your email or sign up for a new account.
        - generic [ref=e13]:
          - generic [ref=e14]:
            - generic [ref=e15]: Email
            - textbox "Email" [ref=e16]:
              - /placeholder: name@example.com
              - text: sylwester.feduk@wavestone.com
          - button "Send reset link" [ref=e17]
      - link "Return to sign in" [ref=e19] [cursor=pointer]:
        - /url: /login
  - generic [ref=e22]:
    - button "Menu" [ref=e23]:
      - img [ref=e25]
      - generic: Menu
    - button "Inspect" [ref=e29]:
      - img [ref=e31]
      - generic: Inspect
    - button "Audit" [ref=e33]:
      - img [ref=e35]
      - generic: Audit
    - button "Settings" [ref=e38]:
      - img [ref=e40]
      - generic: Settings
```