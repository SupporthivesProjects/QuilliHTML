<?php include 'includes/header.php'; ?>

        <section style="padding: 0%;">
            <div class="cont_outer"></div>
            <div class="cont2_outer">
                <div class="container">
                    <div class="cont2_inner">
                        <p class="cont2_p">CONTACT</p>
                        <h2 class="cont2_head">Tell us what you are trying to say.</h2>
                        <p class="cont2_p2">A clear brief is useful. A rough thought is welcome too. Tell us what the writing needs to do and where you are getting stuck.</p>
                    </div>
                </div>
            </div>
            <div class="cont3_outer">
                <div class="conatiner">
                    <div class="cont3_inner">
                        <div class="cont3_inn">
                            <div class="cont3_inside">
                                <div class="cont3_input_div">
                                    <p class="cont3_input_p">FULL NAME</p>
                                    <input type="text" class="cont3_input" placeholder="John Smith">
                                </div>
                                <div class="cont3_input_div">
                                    <p class="cont3_input_p">COMPANY</p>
                                    <input type="text" class="cont3_input" placeholder="Northline Studio">
                                </div>
                            </div>
                            <div class="cont3_inside">
                                <div class="cont3_input_div">
                                    <p class="cont3_input_p">EMAIL</p>
                                    <input type="text" class="cont3_input" placeholder="john@example.com">
                                </div>
                                <div class="cont3_input_div">
                                    <p class="cont3_input_p">SERVICE</p>
                                    <div class="cont3_ser_div">
                                        <input type="text" class="cont3_input2" placeholder="Creative writing">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none">
                                            <path d="M1 1L5 5L9 1" stroke="#1F1B18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div class="cont3_input_div">
                                <p class="cont3_input_p">EMAIL</p>
                                <textarea name="" id="" class="cont3_textarea" placeholder="We are introducing a new product and need to explain what makes it useful."></textarea>
                            </div>
                            <div class="form-check cont3_form_check">
                                <input class="form-check-input cont3_check" type="checkbox" value="" id="checkDefault">
                                <label class="form-check-label cont3_check_lebal" for="checkDefault">
                                    I agree to the Terms & Conditions and Privacy Policy.
                                </label>
                            </div>
                            <div class="cont3_cap_btn">
                                <img src="./img/cont_reCAPTCHA v2 checkbox.png" alt="" class="cont3_recap">
                                <button class="btn cont3_btn" data-bs-toggle="modal" data-bs-target="#exampleModal">Send enquiry</button>
                            </div>
                        </div>
                        <div class="cont3_inn2">
                            <div class="cont3_inn2_div">
                                <p class="cont3_inn2_p">SUPPORT EMAIL</p>
                                <p class="cont3_inn2_p2">hello@quillli.com</p>
                            </div>
                            <div class="cont3_inn2_line"></div>
                            <div class="cont3_inn2_div2">
                                <p class="cont3_inn2_p">PHONE</p>
                                <p class="cont3_inn2_p2">+44 20 7946 0142<br>
                                    Monday to Friday, 9am to 6pm.</p>
                            </div>
                            <div class="cont3_inn2_line"></div>
                            <div class="cont3_inn2_div2">
                                <p class="cont3_inn2_p">STUDIO</p>
                                <p class="cont3_inn2_p2">Quillli Ltd <br>
                                    14 Fore Street, London EC2Y 5EJ</p>
                            </div>
                            <div class="cont3_inn2_line"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cont4_outer">
                <div class="container">
                    <div class="cont4_inner">
                        <div class="cont4_inn">
                            <p class="cont4_p">Keep the conversation useful.</p>
                            <h2 class="cont4_head">what happens next.</h2>
                            <p class="cont4_p2">Your enquiry gives us the context to point you towards the right next step.</p>
                        </div>
                        <div class="cont4_inn2">
                            <div class="cont4_card">
                                <h2 class="cont4_card_head">A closer look</h2>
                                <p class="cont4_card_p">Your message gives us the subject, audience and purpose of the writing.</p>
                            </div>
                            <div class="cont4_card">
                                <h2 class="cont4_card_head">A clear reply</h2>
                                <p class="cont4_card_p">We use the contact details you provide to respond to the enquiry.</p>
                            </div>
                            <div class="cont4_card">
                                <h2 class="cont4_card_head">A defined next step</h2>
                                <p class="cont4_card_p">Choose the right service and review the scope and price before placing an order.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered cont_modal_dialog">
                <div class="modal-content cont_modal_content">
                    <h2 class="cont_modal_head">Your enquiry is on its way.</h2>
                    <p class="cont_modal_p">Thanks for the context. We will use the details you provided to reply to your enquiry.</p>
                    <button class="btn cont_modal_btn">Back to services</button>
                </div>
            </div>
        </div>

<?php include 'includes/footer.php'; ?>