import { Seller } from "../models/seller.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from 'jsonwebtoken';

const genrateAccessandRefreshToken = async (userId) => {
  try {
    const seller = await Seller.findById(userId);
    const accessToken = await seller.generateAccessToken();
    const refreshToken = await seller.generatRefreshToken();

    seller.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while genrating access and refresh token"
    );
  }
};

const registerSeller = asyncHandler(async (req, res) => {
  //get details from fromted
  const {
    email,
    password,
    seller_name,
    company_name,
    company_address,
    Mobile_number,
  } = req.body;

  //validation all filed empty or not
  if (
    [
      email,
      password,
      seller_name,
      company_name,
      company_address,
      Mobile_number,
    ].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "All Fields Are Required");
  }

  //seller exists or not
  const sellerExists = await Seller.findOne({
    $or: [{ email }, { Mobile_number }],
  });

  if (sellerExists) {
    throw new ApiError(409, "Seller Email And Mobile Number Already Exists");
  }

  //create seller object-create entry in db
  const seller = await Seller.create({
    email,
    password,
    seller_name,
    company_name,
    company_address,
    Mobile_number,
  });

  //remove password and refreshtoken field from response
  const createdseller = await Seller.findById(seller._id).select(
    " -password -refreshToken"
  );

  //seller crete or not
  if (!createdseller) {
    throw new ApiError(
      500,
      "Something Went wrong while creating an account! :("
    );
  }

  //return response
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdseller,
        "Seller Registration Succesfully Complete"
      )
    );
});

const loginSeller = asyncHandler(async (req, res) => {
  //get data from req body
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email required");
  }

  //find user
  const seller = await Seller.findOne({ email });

  if (!user) {
    throw new ApiError(404, "Seller does not exists");
  }

  //Check Password
  const isPasswordMatched = await seller.isPasswordCorrect(password);

  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid Seller Credentials");
  }

  //access and refresh token genration
  const { accessToken, refreshToken } = await genrateAccessandRefreshToken(
    seller._id
  );

  const loggedInSeller = await Seller.findById(user._id).select(
    "-password -refreshToken"
  );

  //set access token to cookie

  const options = {
    httpOnly: true,
    secure: true,
  }; //modified by only server not fronted

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          seller: loggedInSeller,
          accessToken,
          refreshToken,
        },
        "Logged In Successfully"
      )
    );
});

const logoutSeller = asyncHandler(async (req, res) => {
  await Seller.findByIdAndUpdate(
    req.seller._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Seller logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorize request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const seller = await Seller.findById(decodedToken?._id);

    if (!seller) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } = await genrateAccessandRefreshToken(seller._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Inavlid Refresh Token");
  }
});

export { registerSeller,loginSeller,logoutSeller,refreshAccessToken };
