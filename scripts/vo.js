      (() => {
        "use strict";

        const $ = (id) => document.getElementById(id);

        const contractState = $("contractState");
        const selectedState = $("selectedState");
        const selectedStateDisplay = $("selectedStateDisplay");
        const requiredForms = $("requiredForms");
        const amendmentParking = $("amendmentWorkspaceParking");
        const amendmentWorkspace = $("inlineAmendmentWorkspace");
        const amendmentForm = $("globalAmendmentForm");
        const amendmentTemplate = $("globalAmendmentTemplate");
        const amendmentFields = $("globalAmendmentFields");
        const generatedAmendment = $("globalGeneratedAmendment");
        const compiledRequirements = $("compiledRequirements");
        const compiledAmendments = $("compiledAmendments");
        const emailOutput = $("emailOutput");

        function setStatus(id, message, isError = false) {
          const element = $(id);
          if (!element) return;

          element.textContent = message;
          element.classList.toggle("is-error", isError);

          window.clearTimeout(element._clearTimer);
          element._clearTimer = window.setTimeout(() => {
            element.textContent = "";
            element.classList.remove("is-error");
          }, 3500);
        }

        async function copyText(text, statusId, successMessage) {
          const value = (text || "").trim();

          if (!value) {
            setStatus(statusId, "There is no wording to copy yet.", true);
            return;
          }

          try {
            await navigator.clipboard.writeText(value);
            setStatus(statusId, successMessage);
          } catch (error) {
            const helper = document.createElement("textarea");
            helper.value = value;
            helper.setAttribute("readonly", "");
            helper.style.position = "fixed";
            helper.style.opacity = "0";
            document.body.appendChild(helper);
            helper.select();

            const copied = document.execCommand("copy");
            helper.remove();

            setStatus(
              statusId,
              copied
                ? successMessage
                : "Copy was unavailable. Select the text and copy it manually.",
              !copied
            );
          }
        }

        function updateStateContext() {
          const selectedOption =
            contractState.options[contractState.selectedIndex];
          const stateName = contractState.value
            ? selectedOption.textContent
            : "";

          selectedState.value = contractState.value;
          selectedStateDisplay.textContent = stateName || "No state selected";
          selectedStateDisplay.dataset.empty = String(!stateName);

          returnAmendmentWorkspace();

          selectedState.dispatchEvent(
            new Event("change", { bubbles: true })
          );
        }

        function returnAmendmentWorkspace() {
          amendmentWorkspace.open = false;
          amendmentParking.appendChild(amendmentWorkspace);
          amendmentParking.classList.add("vc-engine-parking");
          $("activeNigoFormName").value = "";
        }

        function findFormCard(startElement) {
          let current = startElement;

          while (current && current !== requiredForms) {
            const text = (current.textContent || "").toLowerCase();
            const hasStatusControl =
              current.querySelector &&
              Array.from(current.querySelectorAll("button")).some((button) =>
                /\bigo\b|\bnigo\b/i.test(button.textContent || "")
              );

            if (hasStatusControl || text.includes("why is this form nigo")) {
              return current;
            }

            current = current.parentElement;
          }

          return null;
        }

        function readFormIdentity(card) {
          const dataValue =
            card.dataset.formId ||
            card.dataset.formName ||
            card.dataset.form ||
            "";

          if (dataValue) return dataValue.trim();

          const heading = card.querySelector(
            "h2, h3, h4, strong, .form-id, .form-name, [data-form-id]"
          );

          return heading ? heading.textContent.trim() : "Selected state form";
        }

        function attachAmendmentWorkspace(card) {
          if (!card) return;

          const formName = readFormIdentity(card);
          $("activeNigoFormName").value = formName;

          amendmentParking.classList.remove("vc-engine-parking");
          card.appendChild(amendmentWorkspace);

          amendmentForm.innerHTML = "";
          const option = document.createElement("option");
          option.value = formName;
          option.textContent = formName;
          option.selected = true;
          amendmentForm.appendChild(option);
          amendmentForm.value = formName;
          amendmentForm.dispatchEvent(new Event("change", { bubbles: true }));

          window.setTimeout(() => {
            if (amendmentTemplate.options.length > 1) {
              amendmentTemplate.disabled = false;
            }
          }, 0);
        }

        requiredForms.addEventListener("click", (event) => {
          const button = event.target.closest("button");
          if (!button) return;

          const label = (button.textContent || "").trim();
          const card = findFormCard(button);

          if (/^nigo$/i.test(label) || /mark.*nigo/i.test(label)) {
            window.setTimeout(() => attachAmendmentWorkspace(card), 0);
          }

          if (/^igo$/i.test(label) || /mark.*igo/i.test(label)) {
            if (card && card.contains(amendmentWorkspace)) {
              returnAmendmentWorkspace();
            }
          }

          if (/add requirement/i.test(label)) {
            window.setTimeout(refreshSelectedWording, 0);
          }
        });

        requiredForms.addEventListener("change", (event) => {
          const card = findFormCard(event.target);
          const text = (card?.textContent || "").toLowerCase();

          if (text.includes("nigo")) {
            attachAmendmentWorkspace(card);
          }
        });

        new MutationObserver(() => {
          const cards = Array.from(requiredForms.children);
          $("applicableFormCount").textContent = cards.length;
        }).observe(requiredForms, {
          childList: true,
          subtree: true
        });

        function countEntries(value) {
          const text = (value || "").trim();
          if (!text) return 0;

          const listItems = text.match(/^\s*(?:\d+[.)]|[-•])\s+/gm);
          if (listItems?.length) return listItems.length;

          return text
            .split(/\n\s*\n/)
            .map((entry) => entry.trim())
            .filter(Boolean).length;
        }

        function refreshSelectedWording() {
          const requirementCount = countEntries(compiledRequirements.value);
          const amendmentCount = countEntries(compiledAmendments.value);
          const totalCount = requirementCount + amendmentCount;

          $("compiledRequirementBadge").textContent = requirementCount;
          $("compiledRequirementCount").textContent = requirementCount;
          $("compiledAmendmentBadge").textContent = amendmentCount;
          $("compiledAmendmentCount").textContent = amendmentCount;
          $("compiledTotalCount").textContent = `${totalCount} ${
            totalCount === 1 ? "item" : "items"
          }`;
          $("reviewOutputStatus").textContent = totalCount
            ? "Outputs ready"
            : "No outputs";
          $("copyAllRequirements").disabled = requirementCount === 0;
          $("copyAllAmendments").disabled = amendmentCount === 0;
        }

        function clearAmendmentBuilder() {
          amendmentTemplate.value = "";
          amendmentFields.innerHTML = "";
          generatedAmendment.value = "";
          amendmentTemplate.dispatchEvent(
            new Event("change", { bubbles: true })
          );
          setStatus("amendmentActionStatus", "Amendment cleared.");
        }

        function buildFallbackEmail() {
          const requirements = compiledRequirements.value.trim();
          const amendments = compiledAmendments.value.trim();
          const recipient = $("emailGreetingName").value.trim();
          const sender = $("emailSignatureName").value.trim();

          if (!requirements && !amendments) {
            setStatus(
              "emailActionStatus",
              "Add at least one requirement or amendment before building the email.",
              true
            );
            return;
          }

          const lines = [
            "Subject: Additional Requirements for Case Review",
            "",
            recipient ? `Hello ${recipient},` : "Hello,",
            "",
            "During our review, we identified the following outstanding items:"
          ];

          if (amendments) {
            lines.push("", "Amendments Required", amendments);
          }

          if (requirements) {
            lines.push("", "Requirements Needed", requirements);
          }

          lines.push(
            "",
            "Please submit the requested items so we may continue processing the case.",
            "",
            "Thank you,"
          );

          if (sender) lines.push(sender);

          emailOutput.innerText = lines.join("\n");
          setStatus("emailActionStatus", "Email built. You can edit it before copying.");
        }

        contractState.addEventListener("change", updateStateContext);

        $("copyAmendment").addEventListener("click", () => {
          copyText(
            generatedAmendment.value,
            "amendmentActionStatus",
            "Amendment copied."
          );
        });

        $("clearAmendment").addEventListener("click", clearAmendmentBuilder);

        $("addAmendmentToPackage").addEventListener("click", () => {
          window.setTimeout(refreshSelectedWording, 0);
        });

        $("copyAllRequirements").addEventListener("click", () => {
          copyText(
            compiledRequirements.value,
            "reviewOutputCopyStatus",
            "Requirements copied."
          );
        });

        $("copyAllAmendments").addEventListener("click", () => {
          copyText(
            compiledAmendments.value,
            "reviewOutputCopyStatus",
            "Amendments copied."
          );
        });

        $("clearAllRequirements").addEventListener("click", () => {
          compiledRequirements.value = "";
          compiledRequirements.dispatchEvent(
            new Event("input", { bubbles: true })
          );
          refreshSelectedWording();
          setStatus("reviewOutputCopyStatus", "Requirements cleared.");
        });

        $("clearAllAmendments").addEventListener("click", () => {
          compiledAmendments.value = "";
          compiledAmendments.dispatchEvent(
            new Event("input", { bubbles: true })
          );
          refreshSelectedWording();
          setStatus("reviewOutputCopyStatus", "Amendments cleared.");
        });

        $("generateEmail").addEventListener("click", () => {
          window.setTimeout(() => {
            if (!emailOutput.innerText.trim()) {
              buildFallbackEmail();
            }
          }, 0);
        });

        $("copyEmail").addEventListener("click", () => {
          copyText(emailOutput.innerText, "emailActionStatus", "Email copied.");
        });

        $("clearEmail").addEventListener("click", () => {
          emailOutput.innerHTML = "";
          setStatus("emailActionStatus", "Email cleared.");
        });

        [compiledRequirements, compiledAmendments].forEach((element) => {
          element.addEventListener("input", refreshSelectedWording);
          element.addEventListener("change", refreshSelectedWording);
        });

        updateStateContext();
        refreshSelectedWording();
      })();
